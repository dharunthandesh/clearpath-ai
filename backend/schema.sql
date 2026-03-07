# ClearPath AI — PostgreSQL Schema
# Run this script against your PostgreSQL database to set up tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;  -- optional, for geospatial queries

-- ─── obstructions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS obstructions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url        TEXT,
    obstruction_type VARCHAR(64) NOT NULL,
    latitude         DOUBLE PRECISION NOT NULL,
    longitude        DOUBLE PRECISION NOT NULL,
    description      TEXT,
    severity         VARCHAR(10) DEFAULT 'yellow' CHECK (severity IN ('red','yellow','green')),
    reported_by      VARCHAR(128) DEFAULT 'Anonymous',
    timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
    status           VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','resolved','investigating')),
    ai_confidence    FLOAT,
    resolved_at      TIMESTAMPTZ,
    CONSTRAINT chk_lat  CHECK (latitude  BETWEEN -90  AND  90),
    CONSTRAINT chk_lng  CHECK (longitude BETWEEN -180 AND 180)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_obstructions_severity  ON obstructions(severity);
CREATE INDEX IF NOT EXISTS idx_obstructions_type      ON obstructions(obstruction_type);
CREATE INDEX IF NOT EXISTS idx_obstructions_timestamp ON obstructions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_obstructions_status    ON obstructions(status);

-- PostGIS spatial index (optional)
-- ALTER TABLE obstructions ADD COLUMN geom GEOGRAPHY(Point, 4326);
-- UPDATE obstructions SET geom = ST_MakePoint(longitude, latitude);
-- CREATE INDEX IF NOT EXISTS idx_obstructions_geom ON obstructions USING GIST(geom);


-- ─── routes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS route_requests (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_lat      DOUBLE PRECISION NOT NULL,
    start_lng      DOUBLE PRECISION NOT NULL,
    end_lat        DOUBLE PRECISION NOT NULL,
    end_lng        DOUBLE PRECISION NOT NULL,
    eta_minutes    FLOAT,
    route_status   VARCHAR(20),
    obstructions   JSONB DEFAULT '[]',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── reports (citizen) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS citizen_reports (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    obstruction_id   UUID REFERENCES obstructions(id),
    reporter_name    VARCHAR(128),
    reporter_contact VARCHAR(128),
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── Sample seed data ────────────────────────────────────────────────────────
INSERT INTO obstructions (obstruction_type, latitude, longitude, description, severity, reported_by, ai_confidence)
VALUES
  ('illegal_parking',    12.9716, 77.5946, 'Two cars blocking the ambulance lane', 'red',    'AI System', 0.94),
  ('construction',       12.9756, 77.5990, 'Construction materials on road',       'yellow', 'Field Officer', 0.88),
  ('vendor_encroachment',12.9680, 77.5910, 'Vegetable vendors on road',            'yellow', 'Citizen', 0.79)
ON CONFLICT DO NOTHING;
