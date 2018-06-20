CREATE OR REPLACE VIEW public.montevista_units_avl AS
 SELECT gpf.the_geom AS location,
    gpf.properties::json ->> 'VehicleName'::text AS "VehicleName",
    COALESCE(gpf.properties::json ->> 'Heading'::text, '0'::text) AS "Heading",
    COALESCE(gpf.properties::json ->> 'Speed'::text, '0'::text) AS "Speed",
    COALESCE(to_char(to_timestamp((((gpf.properties::json ->> 'UpdateDateTime_UTC'::text)::numeric) / 1000::numeric)::double precision) AT TIME ZONE 'US/Pacific', 'YYYY/MM/DD HH:MI:SS AM PT'::text), ' '::text) || '<br>' ||
    COALESCE(to_char(to_timestamp((((gpf.properties::json ->> 'UpdateDateTime_UTC'::text)::numeric) / 1000::numeric)::double precision), 'YYYY/MM/DD HH:MI:SS AM TZ'::text), ' '::text) AS "UpdatedAt",
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

CREATE OR REPLACE VIEW public.heartland_units_avl AS
 SELECT gpf.the_geom AS location,
    COALESCE(gpf.properties::json ->> 'JurisdictionID'::text, 'Unavailable'::text) AS "JurisdictionID",
    gpf.properties::json ->> 'VehicleName'::text AS "VehicleName",
    gpf.properties::json ->> 'VehicleID'::text AS "VehicleID",
    COALESCE(gpf.properties::json ->> 'UnitLocation_Latitude'::text, 'Unavailable'::text) AS "Latitude",
    COALESCE(gpf.properties::json ->> 'UnitLocation_Longitude'::text, 'Unavailable'::text) AS "Longitude",
    COALESCE(gpf.properties::json ->> 'LocationName'::text, 'Unavailable'::text) AS "Location",
    COALESCE(gpf.properties::json ->> 'LocationCity'::text, 'Unavailable'::text) AS "City",
    COALESCE(gpf.properties::json ->> 'Heading'::text, '0'::text) AS "Heading",
    COALESCE(gpf.properties::json ->> 'Speed'::text, '0'::text) AS "Speed",
    COALESCE(to_char(to_timestamp((((gpf.properties::json ->> 'UpdateDateTime'::text)::numeric) / 1000::numeric)::double precision), 'YYYY/MM/DD HH:MI:SS AM PT'::text), ' '::text) || '<br>' ||
    COALESCE(to_char(to_timestamp((((gpf.properties::json ->> 'UpdateDateTime_UTC'::text)::numeric) / 1000::numeric)::double precision), 'YYYY/MM/DD HH:MI:SS AM TZ'::text), ' '::text) AS "UpdatedAt",
    gpf.properties::json ->> 'OBJECTID'::text AS "ObjectID",
    'Point'::text AS "Shape",
    gpf.properties::json ->> 'IncidentTrackingID'::text AS "IncidentTrackingID",
    gpf.properties::json ->> 'AgencyID'::text AS "AgencyID"
   FROM geojson_point_feeds gpf
  WHERE gpf.feedname::text = 'heartland_units_avl'::text
  ORDER BY (gpf.properties::json ->> 'StatusTime'::text) DESC;