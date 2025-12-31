const mockFiles = [
  { id: 1, name: "Resume.pdf", source: "Google Drive" },
  { id: 2, name: "Project.zip", source: "Dropbox" },
];

const FilesGrid = () => {
  return (
    <div className="grid">
      {mockFiles.map((file) => (
        <div key={file.id} className="glass-card item-card">
          <h4>{file.name}</h4>
          <p>{file.source}</p>
        </div>
      ))}
    </div>
  );
};

export default FilesGrid;
    