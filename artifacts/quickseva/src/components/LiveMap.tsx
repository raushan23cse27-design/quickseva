interface LiveMapProps {
  providerLat?: number | null;
  providerLng?: number | null;
  userLat?: number | null;
  userLng?: number | null;
  height?: number;
}

export default function LiveMap({ providerLat, providerLng, userLat, userLng, height = 320 }: LiveMapProps) {
  const lat = providerLat ?? userLat;
  const lng = providerLng ?? userLng;

  if (lat == null || lng == null) {
    return (
      <div
        className="rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm text-gray-500"
        style={{ height }}
      >
        Live location not available yet
      </div>
    );
  }

  // Build OSM bbox around the point with markers
  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  let markers = `&marker=${lat},${lng}`;
  if (userLat != null && userLng != null && providerLat != null && providerLng != null) {
    markers = `&marker=${providerLat},${providerLng}&marker=${userLat},${userLng}`;
  }
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markers}`;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        title="Live tracking map"
      />
      <div className="bg-gray-50 text-xs text-gray-500 px-3 py-1.5 flex justify-between">
        <span>Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}</span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Open in maps
        </a>
      </div>
    </div>
  );
}
