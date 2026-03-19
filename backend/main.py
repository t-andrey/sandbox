from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime
import json

from database import create_db_and_tables, get_session
from models import (
    Property, PropertyCreate, PropertyRead, PropertyUpdate,
    PropertyStatus, PropertyType, PropertyCondition,
    StatsResponse, PrefectureInfo
)

app = FastAPI(
    title="Akiya Tracker API",
    description="Japan Abandoned House (空き家) Property Tracker",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


def property_to_read(prop: Property) -> dict:
    data = {
        "id": prop.id,
        "title_jp": prop.title_jp,
        "title_en": prop.title_en,
        "prefecture": prop.prefecture,
        "municipality": prop.municipality,
        "village_name": prop.village_name,
        "property_type": prop.property_type,
        "status": prop.status,
        "price_jpy": prop.price_jpy,
        "land_area_m2": prop.land_area_m2,
        "building_area_m2": prop.building_area_m2,
        "year_built": prop.year_built,
        "condition": prop.condition,
        "distance_to_station_km": prop.distance_to_station_km,
        "distance_to_convenience_store_km": prop.distance_to_convenience_store_km,
        "has_akiya_bank_listing": prop.has_akiya_bank_listing,
        "akiya_bank_url": prop.akiya_bank_url,
        "municipal_subsidy_jpy": prop.municipal_subsidy_jpy,
        "tags": prop.tags,
        "description": prop.description,
        "notes": prop.notes,
        "latitude": prop.latitude,
        "longitude": prop.longitude,
        "population_decline_pct": prop.population_decline_pct,
        "created_at": prop.created_at,
        "updated_at": prop.updated_at,
    }
    return data


@app.get("/api/properties", response_model=List[dict])
def list_properties(
    prefecture: Optional[str] = Query(None),
    status: Optional[PropertyStatus] = Query(None),
    property_type: Optional[PropertyType] = Query(None),
    condition: Optional[PropertyCondition] = Query(None),
    max_price: Optional[int] = Query(None),
    min_price: Optional[int] = Query(None),
    free_only: bool = Query(False),
    has_subsidy: bool = Query(False),
    has_akiya_bank: bool = Query(False),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    session: Session = Depends(get_session),
):
    query = select(Property)

    if prefecture:
        query = query.where(Property.prefecture == prefecture)
    if status:
        query = query.where(Property.status == status)
    if property_type:
        query = query.where(Property.property_type == property_type)
    if condition:
        query = query.where(Property.condition == condition)
    if free_only:
        query = query.where(Property.price_jpy == 0)
    if has_subsidy:
        query = query.where(Property.municipal_subsidy_jpy > 0)
    if has_akiya_bank:
        query = query.where(Property.has_akiya_bank_listing == True)
    if max_price is not None:
        query = query.where(
            (Property.price_jpy <= max_price) | (Property.price_jpy == 0)
        )
    if min_price is not None:
        query = query.where(Property.price_jpy >= min_price)

    sort_col = getattr(Property, sort_by, Property.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    query = query.offset(offset).limit(limit)
    properties = session.exec(query).all()
    return [property_to_read(p) for p in properties]


@app.get("/api/properties/{property_id}", response_model=dict)
def get_property(property_id: int, session: Session = Depends(get_session)):
    prop = session.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_to_read(prop)


@app.post("/api/properties", response_model=dict, status_code=201)
def create_property(property_in: PropertyCreate, session: Session = Depends(get_session)):
    data = property_in.dict()
    tags = data.pop("tags", [])
    prop = Property(**data)
    prop.tags = tags
    session.add(prop)
    session.commit()
    session.refresh(prop)
    return property_to_read(prop)


@app.put("/api/properties/{property_id}", response_model=dict)
def update_property(
    property_id: int,
    property_in: PropertyUpdate,
    session: Session = Depends(get_session),
):
    prop = session.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    update_data = property_in.dict(exclude_unset=True)
    tags = update_data.pop("tags", None)

    for key, value in update_data.items():
        setattr(prop, key, value)

    if tags is not None:
        prop.tags = tags

    prop.updated_at = datetime.utcnow()
    session.add(prop)
    session.commit()
    session.refresh(prop)
    return property_to_read(prop)


@app.delete("/api/properties/{property_id}", status_code=204)
def delete_property(property_id: int, session: Session = Depends(get_session)):
    prop = session.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    session.delete(prop)
    session.commit()


@app.get("/api/stats", response_model=dict)
def get_stats(session: Session = Depends(get_session)):
    all_props = session.exec(select(Property)).all()

    total = len(all_props)
    available = sum(1 for p in all_props if p.status == PropertyStatus.available)
    negotiating = sum(1 for p in all_props if p.status == PropertyStatus.negotiating)
    sold = sum(1 for p in all_props if p.status == PropertyStatus.sold)
    reserved = sum(1 for p in all_props if p.status == PropertyStatus.reserved)
    free_properties = sum(1 for p in all_props if p.price_jpy == 0)

    by_prefecture = {}
    for p in all_props:
        by_prefecture[p.prefecture] = by_prefecture.get(p.prefecture, 0) + 1

    by_type = {}
    for p in all_props:
        by_type[p.property_type.value] = by_type.get(p.property_type.value, 0) + 1

    by_condition = {}
    for p in all_props:
        by_condition[p.condition.value] = by_condition.get(p.condition.value, 0) + 1

    priced = [p.price_jpy for p in all_props if p.price_jpy > 0]
    avg_price = sum(priced) / len(priced) if priced else 0

    subsidies = [p.municipal_subsidy_jpy for p in all_props if p.municipal_subsidy_jpy > 0]
    avg_subsidy = sum(subsidies) / len(subsidies) if subsidies else 0

    return {
        "total": total,
        "available": available,
        "negotiating": negotiating,
        "sold": sold,
        "reserved": reserved,
        "free_properties": free_properties,
        "by_prefecture": by_prefecture,
        "by_type": by_type,
        "by_condition": by_condition,
        "avg_price_jpy": avg_price,
        "avg_subsidy_jpy": avg_subsidy,
    }


@app.get("/api/prefectures", response_model=List[dict])
def get_prefectures(session: Session = Depends(get_session)):
    all_props = session.exec(select(Property)).all()

    prefecture_data = {}
    for p in all_props:
        if p.prefecture not in prefecture_data:
            prefecture_data[p.prefecture] = {
                "prefecture": p.prefecture,
                "count": 0,
                "available_count": 0,
                "total_price": 0,
                "priced_count": 0,
            }
        prefecture_data[p.prefecture]["count"] += 1
        if p.status == PropertyStatus.available:
            prefecture_data[p.prefecture]["available_count"] += 1
        if p.price_jpy > 0:
            prefecture_data[p.prefecture]["total_price"] += p.price_jpy
            prefecture_data[p.prefecture]["priced_count"] += 1

    result = []
    for pref, data in prefecture_data.items():
        avg = (
            data["total_price"] / data["priced_count"]
            if data["priced_count"] > 0
            else 0
        )
        result.append({
            "prefecture": data["prefecture"],
            "count": data["count"],
            "available_count": data["available_count"],
            "avg_price_jpy": avg,
        })

    result.sort(key=lambda x: x["count"], reverse=True)
    return result


@app.get("/health")
def health():
    return {"status": "ok", "service": "Akiya Tracker API"}
