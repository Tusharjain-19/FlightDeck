import SearchInterface from '../components/SearchInterface';

export default function Page() {
  return (
    <>
      <div className="hero">
        <h1>Track any flight,<br />in real time</h1>
      </div>

      <div className="container">
        <SearchInterface />
      </div>
    </>
  );
}
