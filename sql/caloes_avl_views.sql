CREATE OR REPLACE VIEW public.caloes_vehicles_avl AS 
 SELECT gpf.the_geom AS location,
    gpf.properties::json ->> 'UNIT__'::text AS "UNIT__",
    gpf.properties::json ->> 'OBJECTID'::text AS "ObjectID",
    gpf.properties::json ->> 'VIN'::text AS "VIN",
    COALESCE(gpf.properties::json ->> 'Heading'::text, '0'::text) AS "Heading",
    COALESCE(gpf.properties::json ->> 'InstSpeedMPH'::text, '0'::text) AS "InstSpeedMPH",
    gpf.properties::json ->> 'Unit_Classification'::text AS "UnitClassification",
    COALESCE(gpf.properties::json ->> 'MessageTimeTxt'::text, 'Unavailable'::text) AS "MessageTimeTxt",
    gpf.properties::json ->> 'Latitude'::text AS "Latitude",
    gpf.properties::json ->> 'Longitude'::text AS "Longitude",
    'Point'::text AS "Shape"
   FROM geojson_point_feeds gpf
  WHERE gpf.feedname::text = 'caloes_vehicles_avl'::text
  ORDER BY (gpf.properties::json ->> 'MessageTimeTxt'::text) DESC;
