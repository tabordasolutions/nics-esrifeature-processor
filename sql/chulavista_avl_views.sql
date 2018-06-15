CREATE OR REPLACE VIEW public.montevista_units_avl AS
 SELECT gpf.the_geom AS location,
    gpf.properties::json ->> 'VehicleName'::text AS "VehicleName",
    COALESCE(gpf.properties::json ->> 'Heading'::text, '0'::text) AS "Heading",
    COALESCE(gpf.properties::json ->> 'Speed'::text, '0'::text) AS "Speed",
    COALESCE(to_char(to_timestamp((((gpf.properties::json ->> 'UpdateDateTime_UTC'::text)::numeric) / 1000::numeric)::double precision), 'YYYY/MM/DD HH:MI:SS AM'::text), ' '::text) AS "UpdatedAt_UTC",
    gpf.properties::json ->> 'OBJECTID'::text AS "ObjectID",
    COALESCE(gpf.properties::json ->> 'UnitLocation_Latitude'::text, 'Unavailable'::text) as "Latitude",
    COALESCE(gpf.properties::json ->> 'UnitLocation_Longitude'::text, 'Unavailable'::text) as "Longitude",
    'Point'::text AS "Shape",
    gpf.properties::json ->> 'VehicleID'::text as "VehicleID",
    COALESCE(NULLIF(gpf.properties::json ->> 'Description'::text, ''),'Unavailable'::text) as "Description",
    COALESCE(gpf.properties::json ->> 'JurisdictionID'::text, 'Unavailable'::text) as "JurisdictionID"
   FROM geojson_point_feeds gpf
  WHERE gpf.feedname::text = 'montevista_units_avl'::text
  ORDER BY (gpf.properties::json ->> 'StatusTime'::text) DESC;