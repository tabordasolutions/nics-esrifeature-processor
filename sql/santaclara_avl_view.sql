
CREATE OR REPLACE VIEW Santaclara_avl AS
    select
    gpf.the_geom AS location,
    ((gpf.properties)::json ->> 'Unit_ID'::text) AS "Unit_ID",
    ((gpf.properties)::json ->> 'Unit_Status_Desc') AS "Unit_Status_Desc",
    ((gpf.properties)::json ->> 'Unit_Status_Code') AS "Unit_Status_Code",
    ((gpf.properties)::json ->> 'UnitStatus') AS "UnitStatus",
    ((gpf.properties)::json ->> 'Unit_Type') AS "Unit_Type",
    coalesce(to_char(to_timestamp( ((gpf.properties)::json ->> 'StatusTime')::numeric/1000), 'YYYY/MM/DD HH24:MI:SS'), ' ') AS "StatusTime",
    ((gpf.properties)::json ->> 'Inc_ID') AS "Inc_ID",
    ((gpf.properties)::json ->> 'Inc_Address') AS "Inc_Address",
    ((gpf.properties)::json ->> 'CAD_Pri_Desc') AS "CAD_Pri_Desc",
    coalesce(to_char(to_timestamp(((gpf.properties)::json ->> 'LastUpdate')::numeric/1000), 'YYYY/MM/DD HH24:MI:SS'), ' ') AS "LastUpdate",
    coalesce(((gpf.properties)::json ->> 'Direction'), '0') AS "Direction",
    coalesce(((gpf.properties)::json ->> 'Speed'), '0')  AS "Speed",
    ((gpf.properties)::json ->> 'GPSStatus') AS "GPSStatus",
    ((gpf.properties)::json ->> 'CurrentStation') AS "CurrentStation",
    ((gpf.properties)::json ->> 'Station') AS "Station",
    ((gpf.properties)::json ->> 'Agency') AS "Agency",
    ((gpf.properties)::json ->> 'CAD_Pri_Code') AS "CAD_Pri_Code",
    coalesce(((gpf.properties)::json ->> 'TrackingID'), ' ') AS "TrackingID",
    ((gpf.properties)::json ->> 'CoordX') AS "CoordX",
    ((gpf.properties)::json ->> 'CoordY') AS "CoordY",
    ((gpf.properties)::json ->> 'Latitude') AS Latitude,
    ((gpf.properties)::json ->> 'Longitude') AS Longitude,
    ((gpf.properties)::json ->> 'DisplayOrder') AS "DisplayOrder"
    from geojson_point_feeds gpf where gpf.feedname = 'santaclara_avl' order by ((gpf.properties)::json ->> 'StatusTime') desc;