function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function generateWordleHtml(
  symbols: string[],
  english: string,
  guessCount: number,
  showHints: boolean,
  difficulty: string
) {
  const answer = JSON.stringify(symbols);
  const hints = JSON.stringify({
    "θ": "TH (as in thin)",
    "ɪ": "I (as in ship)",
    "n": "N (as in no)",
    "ʃ": "SH (as in ship)",
    "tʃ": "CH (as in chin)",
    "dʒ": "J (as in jam)",
    "æ": "A (as in cat)",
    "ɐ": "U (as in sun)",
    "ɹ": "R (as in ring)",
    "ŋ": "NG (as in ring)"
  });
  const keys = JSON.stringify([
    "p", "t", "k", "b", "d", "g", "n", "m", "ŋ", "f", "s", "θ", "ʃ", "v", "z", "ð", "l", "ɹ", "w", "j", "h", "tʃ", "dʒ",
    "iː", "ɪ", "e", "eː", "æ", "ɐ", "ɐː", "ɜː", "ʉː", "ɔ", "oː", "ʊ", "æɪ", "ɑe", "oɪ", "əʉ", "æɔ", "ɪə", "ə"
  ]);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PHONEME'LE</title>
<style>
body{font-family:Arial,sans-serif;margin:0;background:#fff;color:#111}
.header{border-bottom:2px solid #222;text-align:center;font-weight:bold;font-size:12px;padding:10px}
.box{max-width:1000px;margin:20px auto;padding:18px}
.layout{display:grid;grid-template-columns:1fr 1.25fr;gap:20px;border:1px solid #222}
.left,.right{padding:18px}.left{border-right:1px solid #222}
.board{display:grid;grid-template-columns:repeat(${Math.max(symbols.length, 1)},46px);gap:5px;justify-content:center;margin:15px auto}
.cell{width:46px;height:46px;border:1px solid #222;display:flex;align-items:center;justify-content:center;font-weight:bold}
.cell.correct{background:#dff3df}.cell.close{background:#fff7c7}.cell.wrong{background:#f1f1f1;color:#777}
.keys{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;border:1px solid #222}
.keys button{min-height:40px;background:white;border:1px solid #999;cursor:pointer;position:relative}
.keys button:hover:after{content:attr(data-hint);position:absolute;left:50%;bottom:calc(100% + 5px);transform:translateX(-50%);background:#111;color:#fff;padding:5px 7px;font-size:11px;white-space:nowrap}
button.action{padding:9px 15px;border:1px solid #222;background:#195b92;color:#fff;cursor:pointer}
button.action:disabled{background:#999;cursor:not-allowed}
button{font:inherit}.info{margin-top:10px;padding:8px;border:1px solid #222}
@media(max-width:700px){.layout{grid-template-columns:1fr}.left{border-right:0;border-bottom:1px solid #222}.keys{grid-template-columns:repeat(4,1fr)}}
</style>
</head>
<body>
<div class="header">PHONEME'LE - ${difficulty} - ${guessCount} GUESSES</div>
<div class="box">
<div class="layout">
<div class="left">
<h2>PHONEME'LE</h2>
<p>Use the phoneme keyboard to make a guess.</p>
<p><strong>Phoneme Word:</strong> /${symbols.join(" ")}/</p>
<p><strong>English Word:</strong> ${english.toUpperCase()}</p>
<p><strong>Hints:</strong> ${showHints ? "Yes" : "No"}</p>
</div>
<div class="right">
<div id="board" class="board"></div>
<div id="keys" class="keys"></div>
<div style="text-align:center;margin-top:12px"><button class="action" id="enter">ENTER</button> <button class="action" id="delete">DELETE</button> <button class="action" id="reset">RESET</button></div>
<div id="message" class="info"></div>
</div>
</div>
</div>
<script>
const answer=${answer};
const hints=${hints};
const keys=${keys};
const showHints=${showHints};
const maxGuesses=${guessCount};
let guess=[];
let guesses=[];
let gameOver=false;
const board=document.getElementById('board');
const keyBox=document.getElementById('keys');
const message=document.getElementById('message');

function draw(){
  board.innerHTML='';
  for(let row=0;row<maxGuesses;row++){
    for(let col=0;col<answer.length;col++){
      const d=document.createElement('div');
      d.className='cell';
      const saved=guesses[row];
      const value=saved ? saved.symbols[col] || '' : (row===guesses.length ? guess[col] || '' : '');
      d.textContent=value;
      if(saved){
        if(saved.result[col]==='correct') d.classList.add('correct');
        if(saved.result[col]==='close') d.classList.add('close');
        if(saved.result[col]==='wrong') d.classList.add('wrong');
      }
      board.appendChild(d);
    }
  }
}

function getResult(current){
  return current.map((symbol,index)=>{
    if(symbol===answer[index]) return 'correct';
    if(answer.includes(symbol)) return 'close';
    return 'wrong';
  });
}

keys.forEach(k=>{
  const b=document.createElement('button');
  b.textContent=k;
  if(showHints){b.setAttribute('data-hint',hints[k]||k)}
  b.onclick=()=>{
    if(gameOver) return;
    if(guess.length<answer.length){guess.push(k);draw()}
  };
  keyBox.appendChild(b);
});

document.getElementById('enter').onclick=()=>{
  if(gameOver) return;
  if(guess.length!==answer.length){message.textContent='Please fill all the boxes first.';return;}
  const result=getResult(guess);
  const correct=guess.every((symbol,index)=>symbol===answer[index]);
  guesses.push({symbols:[...guess],result:result});
  guess=[];
  draw();
  if(correct){gameOver=true;message.textContent='Correct! The English word is ${english.toUpperCase()}.';return;}
  if(guesses.length>=maxGuesses){gameOver=true;message.textContent='No more guesses. The answer was /${symbols.join(" ")}/ (${english.toUpperCase()}).';return;}
  message.textContent='Not quite. Try again. '+(maxGuesses-guesses.length)+' guess'+((maxGuesses-guesses.length)===1?'':'es')+' left.';
};

document.getElementById('delete').onclick=()=>{if(!gameOver){guess.pop();draw()}};

document.getElementById('reset').onclick=()=>{guess=[];guesses=[];gameOver=false;message.textContent='';draw()};

draw();
</script>
</body>
</html>`;

  downloadFile("phoneme-wordle.html", html);
}

export function generateWordSearchHtml(difficulty: string) {
  const words = [
    ["ʃ", "ɪ", "p"],
    ["tʃ", "ɪ", "n"],
    ["dʒ", "æ", "m"],
    ["ɹ", "ɪ", "ŋ"],
    ["s", "ɐ", "n"]
  ];

  const englishWords = ["ship", "chin", "jam", "ring", "sun"];
  const directions = difficulty === "Easy"
    ? [[0,1]]
    : difficulty === "Medium"
      ? [[0,1],[1,0]]
      : [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];

  const wordsJson = JSON.stringify(words);
  const englishJson = JSON.stringify(englishWords);
  const directionsJson = JSON.stringify(directions);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Phoneme Word Search</title>
<style>
body{font-family:Arial,sans-serif;max-width:900px;margin:30px auto;padding:20px;background:#fff;color:#111}
.box{border:1px solid #222;padding:20px}.grid{display:grid;grid-template-columns:repeat(10,1fr);gap:2px;max-width:600px;margin:20px auto}
.cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:white;border:1px solid #222;font-weight:bold;cursor:pointer;padding:0}
.cell.selected{background:#fff7c7}.cell.found{background:#dff3df}.words{display:flex;gap:8px;flex-wrap:wrap}.chip{padding:6px 9px;border:1px solid #222}.chip.found{text-decoration:line-through;background:#dff3df}
.info{margin-top:12px;padding:9px;border:1px solid #222}
button.action{padding:9px 15px;border:1px solid #222;background:#195b92;color:#fff;cursor:pointer}
@media(max-width:650px){body{margin:10px;padding:10px}}
</style>
</head>
<body>
<div class="box">
<h1>PHONEME WORD SEARCH</h1>
<p>Difficulty: ${difficulty}</p>
<p>Click the first phoneme and then the last phoneme of a word.</p>
<div id="grid" class="grid"></div>
<div style="text-align:center"><button class="action" id="new">NEW GRID</button></div>
<p><strong>Find:</strong></p><div id="words" class="words"></div>
<div id="message" class="info">Click the first and last cell of a word.</div>
</div>
<script>
const target=${wordsJson};
const english=${englishJson};
const directions=${directionsJson};
const pool=['p','t','k','b','d','g','m','n','ŋ','f','s','θ','ʃ','v','z','ɹ','æ','ɪ','ɐ','tʃ','dʒ'];
const size=10;
let matrix=[];
let placed=[];
let startCell=null;
let found=[];

function canPlace(grid,word,row,col,dr,dc){
  for(let i=0;i<word.length;i++){
    const r=row+dr*i; const c=col+dc*i;
    if(r<0||r>=size||c<0||c>=size) return false;
    if(grid[r][c]&&grid[r][c]!==word[i]) return false;
  }
  return true;
}

function makeGrid(){
  matrix=Array.from({length:size},()=>Array(size).fill(''));
  placed=[];
  target.forEach(word=>{
    let done=false;
    for(let attempt=0;attempt<200&&!done;attempt++){
      const dir=directions[Math.floor(Math.random()*directions.length)];
      const row=Math.floor(Math.random()*size); const col=Math.floor(Math.random()*size);
      if(canPlace(matrix,word,row,col,dir[0],dir[1])){
        for(let i=0;i<word.length;i++) matrix[row+dir[0]*i][col+dir[1]*i]=word[i];
        placed.push({start:{row:row,col:col},end:{row:row+dir[0]*(word.length-1),col:col+dir[1]*(word.length-1)}});
        done=true;
      }
    }
  });
  for(let r=0;r<size;r++) for(let c=0;c<size;c++) if(!matrix[r][c]) matrix[r][c]=pool[Math.floor(Math.random()*pool.length)];
}

function pathFrom(a,b){
  const dr=b.row-a.row; const dc=b.col-a.col;
  if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc))) return null;
  const steps=Math.max(Math.abs(dr),Math.abs(dc));
  const sr=dr===0?0:dr/steps; const sc=dc===0?0:dc/steps;
  const path=[];
  for(let i=0;i<=steps;i++) path.push({row:a.row+sr*i,col:a.col+sc*i});
  return path;
}

function draw(){
  const grid=document.getElementById('grid'); grid.innerHTML='';
  for(let r=0;r<size;r++) for(let c=0;c<size;c++){
    const d=document.createElement('button'); d.className='cell'; d.textContent=matrix[r][c];
    const key=r+'-'+c;
    if(found.some(item=>item.cells.some(cell=>cell.row===r&&cell.col===c))) d.classList.add('found');
    d.onclick=()=>selectCell({row:r,col:c});
    grid.appendChild(d);
  }
  const wordsBox=document.getElementById('words'); wordsBox.innerHTML='';
  english.forEach((word,i)=>{
    const span=document.createElement('span'); span.className='chip'+(found.some(item=>item.index===i)?' found':''); span.textContent='/'+target[i].join(' ')+'/'; wordsBox.appendChild(span);
  });
}

function selectCell(cell){
  if(!startCell){startCell=cell;document.getElementById('message').textContent='Now click the last cell of the word.';return;}
  const path=pathFrom(startCell,cell);
  if(!path){startCell=null;document.getElementById('message').textContent='Please choose a straight line.';draw();return;}
  const word=path.map(p=>matrix[p.row][p.col]).join('|');
  const reverse=[...path].reverse().map(p=>matrix[p.row][p.col]).join('|');
  let foundIndex=-1;
  target.forEach((item,i)=>{const check=item.join('|');if(check===word||check===reverse)foundIndex=i});
  if(foundIndex>=0){
    if(!found.some(item=>item.index===foundIndex)) found.push({index:foundIndex,cells:path});
    document.getElementById('message').textContent=found.length===target.length?'Great! You found all five words.':'Found '+english[foundIndex]+'. Keep going!';
  }else{
    document.getElementById('message').textContent='That selection is not one of the words.';
  }
  startCell=null; draw();
}

document.getElementById('new').onclick=()=>{found=[];startCell=null;document.getElementById('message').textContent='Click the first and last cell of a word.';makeGrid();draw()};
makeGrid(); draw();
</script>
</body>
</html>`;

  downloadFile("phoneme-word-search.html", html);
}
