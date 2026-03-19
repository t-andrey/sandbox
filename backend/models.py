from typing import List, Optional
from enum import Enum
from datetime import datetime
from sqlmodel import Field, SQLModel, JSON, Column
import json


class PropertyType(str, Enum):
    akiya = "akiya"
    kominka = "kominka"
    noka = "noka"
    vacant_land = "vacant_land"


class PropertyStatus(str, Enum):
    available = "available"
    negotiating = "negotiating"
    sold = "sold"
    reserved = "reserved"


class PropertyCondition(str, Enum):
    livable = "livable"
    renovation_needed = "renovation_needed"
    major_renovation = "major_renovation"
    teardown = "teardown"


class PropertyBase(SQLModel):
    title_jp: str
    title_en: str
    prefecture: str
    municipality: str
    village_name: Optional[str] = None
    property_type: PropertyType = PropertyType.akiya
    status: PropertyStatus = PropertyStatus.available
    price_jpy: int = 0  # 0 = free / 無料
    land_area_m2: Optional[float] = None
    building_area_m2: Optional[float] = None
    year_built: Optional[int] = None
    condition: PropertyCondition = PropertyCondition.renovation_needed
    distance_to_station_km: Optional[float] = None
    distance_to_convenience_store_km: Optional[float] = None
    has_akiya_bank_listing: bool = False
    akiya_bank_url: Optional[str] = None
    municipal_subsidy_jpy: int = 0
    description: Optional[str] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population_decline_pct: Optional[float] = None  # % population decline over last 20 years
    # Tags stored as JSON string in SQLite
    tags_json: Optional[str] = Field(default="[]", sa_column_kwargs={"name": "tags_json"})


class Property(PropertyBase, table=True):
    __tablename__ = "properties"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def tags(self) -> List[str]:
        return json.loads(self.tags_json or "[]")

    @tags.setter
    def tags(self, value: List[str]):
        self.tags_json = json.dumps(value, ensure_ascii=False)


class PropertyCreate(PropertyBase):
    tags: List[str] = []

    class Config:
        # Exclude tags_json from create schema - use tags instead
        pass


class PropertyRead(SQLModel):
    id: int
    title_jp: str
    title_en: str
    prefecture: str
    municipality: str
    village_name: Optional[str] = None
    property_type: PropertyType
    status: PropertyStatus
    price_jpy: int
    land_area_m2: Optional[float] = None
    building_area_m2: Optional[float] = None
    year_built: Optional[int] = None
    condition: PropertyCondition
    distance_to_station_km: Optional[float] = None
    distance_to_convenience_store_km: Optional[float] = None
    has_akiya_bank_listing: bool
    akiya_bank_url: Optional[str] = None
    municipal_subsidy_jpy: int
    tags: List[str] = []
    description: Optional[str] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population_decline_pct: Optional[float] = None
    created_at: datetime
    updated_at: datetime


class PropertyUpdate(SQLModel):
    title_jp: Optional[str] = None
    title_en: Optional[str] = None
    prefecture: Optional[str] = None
    municipality: Optional[str] = None
    village_name: Optional[str] = None
    property_type: Optional[PropertyType] = None
    status: Optional[PropertyStatus] = None
    price_jpy: Optional[int] = None
    land_area_m2: Optional[float] = None
    building_area_m2: Optional[float] = None
    year_built: Optional[int] = None
    condition: Optional[PropertyCondition] = None
    distance_to_station_km: Optional[float] = None
    distance_to_convenience_store_km: Optional[float] = None
    has_akiya_bank_listing: Optional[bool] = None
    akiya_bank_url: Optional[str] = None
    municipal_subsidy_jpy: Optional[int] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    population_decline_pct: Optional[float] = None


class StatsResponse(SQLModel):
    total: int
    available: int
    negotiating: int
    sold: int
    reserved: int
    free_properties: int
    by_prefecture: dict
    by_type: dict
    by_condition: dict
    avg_price_jpy: float
    avg_subsidy_jpy: float


class PrefectureInfo(SQLModel):
    prefecture: str
    count: int
    available_count: int
    avg_price_jpy: float
