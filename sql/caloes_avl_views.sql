CREATE OR REPLACE VIEW public.caloes_vehicles_avl AS
 SELECT gpf.the_geom AS location,
   gpf.properties::json ->> 'UNIT__'::text AS "UNIT__",
   gpf.properties::json ->> 'OBJECTID'::text AS "ObjectID",
       gpf.properties::json ->> 'VIN' AS "VIN",
       COALESCE(gpf.properties::json ->> 'Heading'::text, '0') AS "Heading",
       COALESCE(gpf.properties::json ->> 'InstSpeedMPH'::text, '0') AS "InstSpeedMPH",
       gpf.properties::json ->> 'Unit_Classification'::text AS "UnitClassification",
       COALESCE(gpf.properties::json ->> 'MessageTimeTxt'::text, 'Unavailable') AS "MessageTimeTxt",
       gpf.properties::json ->> 'Latitude' AS "Latitude",
       gpf.properties::json ->> 'Longitude'::text AS "Longitude",
       'Point'::text AS "Shape"
   FROM geojson_point_feeds gpf
   WHERE gpf.feedname = 'caloes_vehicles_avl'
   ORDER BY (gpf.properties::json ->> 'MessageTimeTxt'::text) DESC;
