CREATE OR REPLACE VIEW public.santabarbara_avl AS
 SELECT gpf.the_geom,
    COALESCE(gpf.properties::json ->> 'uuid'::text, ' '::text) AS "UUID",
    COALESCE(gpf.properties::json ->> 'name'::text, ' '::text) AS "Name",
    gpf.properties::json ->> 'short_name'::text AS "ShortName",
    gpf.properties::json ->> 'standard_status_code'::text AS "Standard_Status_Code",
    gpf.properties::json ->> 'ESRI_OID'::text AS "ESRI_OID",
    gpf.properties::json ->> 'group_name'::text AS "Group_Name",
    gpf.properties::json ->> 'popupinfo'::text AS popupinfo
   FROM geojson_point_feeds gpf
  WHERE gpf.feedname::text = 'santabarbara_avl'::text AND gpf.created_at = (( SELECT max(geojson_point_feeds.created_at) AS max
           FROM geojson_point_feeds
          WHERE geojson_point_feeds.feedname::text = 'santabarbara_avl'::text));