CREATE OR REPLACE VIEW santabarbara_avl AS
select gpf.the_geom AS locaiton,
       coalesce(((gpf.properties)::json ->> 'uuid'::text), ' ') AS "UUID",
       coalesce(((gpf.properties)::json ->> 'name'::text), ' ')  AS "Name",
       ((gpf.properties)::json ->> 'short_name'::text) AS "ShortName",
       ((gpf.properties)::json ->> 'standard_status_code') AS "Standard_Status_Code",
       ((gpf.properties)::json ->> 'ESRI_OID'::text) AS "ESRI_OID",
       ((gpf.properties)::json ->> 'group_name'::text) AS "Group_Name",
       ((gpf.properties)::json ->> 'popupinfo'::text) AS "popupinfo"
FROM public.geojson_point_feeds gpf where feedname = 'santabarbara_avl';