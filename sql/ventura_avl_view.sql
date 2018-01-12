CREATE OR REPLACE VIEW Ventura_avl AS
select gpf.the_geom AS locaiton,
       coalesce(((gpf.properties)::json ->> 'Battalion'::text), ' ') AS "Battalion",
       coalesce(((gpf.properties)::json ->> 'CurrentCity'::text), ' ')  AS "CurrentCity",
       ((gpf.properties)::json ->> 'CurrentLocation'::text) AS "CurrentLocation",
       ((gpf.properties)::json ->> 'CurrentLat') AS "CurrentLat",
       ((gpf.properties)::json ->> 'CurrentLon'::text) AS "CurrentLon",
       ((gpf.properties)::json ->> 'IncidentId'::text) AS "IncidentId",
       coalesce( to_char(to_timestamp( ((gpf.properties)::json ->> 'LastAvlUpdate')::numeric/1000), 'YYYY/MM/DD HH24:MI:SS "Pacific US"'), ' ') AS "LastUpdate",
       coalesce(((gpf.properties)::json ->> 'StationName'::text), ' ') AS "Station",
       ((gpf.properties)::json ->> 'UnitName'::text) AS "Unit",
       ((gpf.properties)::json ->> 'UnitType'::text) AS "UnitType",
       ((gpf.properties)::json ->> 'StatusId'::text) AS "StatusId"
FROM public.geojson_point_feeds gpf where feedname = 'ventura_avl';