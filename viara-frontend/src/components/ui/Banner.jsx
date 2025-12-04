import '../../styles/Banner.css';

function Banner({ title, subtitle, backgroundImage }) {
  return (
    <div 
      className="banner" 
      style={{
        backgroundImage: backgroundImage 
          ? `url(${backgroundImage})` 
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <div className="banner-overlay">
        <h1 className="banner-title">{title}</h1>
        {subtitle && <p className="banner-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default Banner;