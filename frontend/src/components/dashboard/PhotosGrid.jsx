const mockPhotos = [
  { id: 1, name: "Beach.png", source: "Google Photos" },
  { id: 2, name: "Trip.jpg", source: "OneDrive" },
];

const PhotosGrid = () => {
  return (
    <div className="grid">
      {mockPhotos.map((photo) => (
        <div key={photo.id} className="glass-card item-card">
          <h4>{photo.name}</h4>
          <p>{photo.source}</p>
        </div>
      ))}
    </div>
  );
};

export default PhotosGrid;
