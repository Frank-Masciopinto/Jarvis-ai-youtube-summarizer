import './Loader.css';

function Loader({size = 16}) {
  return <div className="round-loader" style={{width: size, height: size}}/>;
}

export default Loader;
