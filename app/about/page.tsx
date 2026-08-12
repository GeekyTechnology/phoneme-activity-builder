export default function About() {
  return (
    <div className="page">
      <div className="panel">
        <h1>About</h1>
        <p>
          This project is a frontend builder for Speech Pathology teachers. It lets a teacher set up a
          phoneme Wordle or Word Search, check the preview and download the activity as one HTML file.
        </p>
        <p>
          Assessment 1 is frontend only. A database and larger word list are planned for later assessments.
          For this version the Wordle uses one word and the Word Search uses a small fixed list.
        </p>

        <h2>Student details</h2>
        <p><strong>Name:</strong> Zac Whyte</p>
        <p><strong>Student number:</strong> 22308075</p>
      </div>
    </div>
  );
}
