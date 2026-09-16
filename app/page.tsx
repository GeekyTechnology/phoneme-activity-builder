import Link from "next/link";

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Phoneme Activity Builder</h1>
        <p>
          This is a frontend tool for teachers to make simple phoneme based classroom activities.
          Assessment 1 focuses on the interface, usability and creating a standalone HTML activity.
        </p>

        <div className="cards">
          <div className="card">
            <h2>Wordle</h2>
            <p className="small">Build and preview a small phoneme Wordle activity.</p>
            <Link className="primary" href="/wordle" style={{ display: "inline-block", marginTop: 12 }}>
              Open Wordle
            </Link>
          </div>
          <div className="card">
            <h2>Word Search</h2>
            <p className="small">Use five fixed phoneme words to make a word search.</p>
            <Link className="primary" href="/word-search" style={{ display: "inline-block", marginTop: 12 }}>
              Open Word Search
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
