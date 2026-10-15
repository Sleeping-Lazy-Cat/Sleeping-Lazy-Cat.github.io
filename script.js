// Данные слов: num — видимый номер на поле, id — уникальный системный идентификатор
const crosswordData = [
    { id: 1, num: 1, answer: "ШПАГА", clue: "Наградное личное оружие генерала, украшенное алмазами и надписью «За храбрость».", dir: "H", x: 8, y: 0 },
    { id: 2, num: 2, answer: "ПРИСЯГА", clue: "Государственная процедура, задержка которой в 1825 году привела к политическому кризису, восстанию и гибели полководца.", dir: "V", x: 9, y: 0 },
    { id: 3, num: 3, answer: "ГРАФ", clue: "Почетный дворянский титул, пожалованный военачальнику в 1813 году за боевые заслуги.", dir: "V", x: 7, y: 4 },
    { id: 4, num: 4, answer: "БОРОДИНО", clue: "Место главного сражения Отечественной войны 1812 года, где генерал командовал правым крылом армии.", dir: "V", x: 13, y: 4 },
    { id: 5, num: 5, answer: "АВАНГАРД", clue: "Передовой отряд войск, мастерское командование которым считается одной из главных тактических заслуг полководца.", dir: "H", x: 7, y: 6 },
    { id: 6, num: 6, answer: "ДОУ", clue: "Английский живописец, автор портрета М.А. Милорадовича для Военной галереи Зимнего дворца.", dir: "V", x: 10, y: 7 },
    { id: 7, num: 7, answer: "ИНФАНТЕРИЯ", clue: "Род войск (пехота), в котором М.А. Милорадович служил в чине полного генерала.", dir: "V", x: 11, y: 8 },
    { id: 8, num: 8, answer: "МУНДИР", clue: "Предмет военной формы М.А. Милорадовича со следами рокового ранения, являющийся экспонатом коллекции Эрмитажа.", dir: "H", x: 9, y: 9 },
    { id: 9, num: 8, answer: "МЮРАТ", clue: "Знаменитый французский маршал, с которым современники часто сравнивали Милорадовича за бесстрашие в бою («русский ...»).", dir: "V", x: 9, y: 9 },
    { id: 10, num: 9, answer: "ЛАВРА", clue: "Монастырь (Александро-Невская ...), на территории которого находится могила полководца.", dir: "H", x: 8, y: 15 }
];

const gridWidth = 20;
const gridHeight = 18;
let gridModel = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));

let currentDir = 'H';
let currentCell = null;

// Инициализация стартового окна
document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-modal').classList.add('hidden');
});

// Формирование матрицы сетки
crosswordData.forEach(w => {
    let cx = w.x;
    let cy = w.y;
    for (let i = 0; i < w.answer.length; i++) {
        if (!gridModel[cy][cx]) {
            gridModel[cy][cx] = { char: w.answer[i], hWordId: null, vWordId: null, number: null };
        }
        if (i === 0) gridModel[cy][cx].number = w.num;
        
        if (w.dir === 'H') gridModel[cy][cx].hWordId = w.id;
        if (w.dir === 'V') gridModel[cy][cx].vWordId = w.id;
        
        w.dir === 'H' ? cx++ : cy++;
    }
});

const board = document.getElementById('crossword-board');
const hClues = document.getElementById('horizontal-clues');
const vClues = document.getElementById('vertical-clues');

// Отрисовка списка вопросов
crosswordData.forEach(w => {
    const li = document.createElement('li');
    li.innerText = `${w.num}. ${w.clue}`;
    li.id = `clue-${w.id}`; // уникальный ID элемента
    li.addEventListener('click', () => {
        currentDir = w.dir;
        document.getElementById(`input-${w.x}-${w.y}`).focus();
    });
    w.dir === 'H' ? hClues.appendChild(li) : vClues.appendChild(li);
});

// Отрисовка клеток кроссворда
for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
        const cellData = gridModel[y][x];
        const wrapper = document.createElement('div');
        wrapper.className = 'cell';
        wrapper.id = `cell-${x}-${y}`;

        if (cellData) {
            if (cellData.number) {
                const numEl = document.createElement('div');
                numEl.className = 'number';
                numEl.innerText = cellData.number;
                wrapper.appendChild(numEl);
            }

            const input = document.createElement('input');
            input.id = `input-${x}-${y}`;
            input.maxLength = 1;
            input.autocomplete = "off";

            wrapper.addEventListener('click', () => {
                if (currentCell && currentCell.x === x && currentCell.y === y) {
                    if (cellData.hWordId && cellData.vWordId) {
                        currentDir = currentDir === 'H' ? 'V' : 'H';
                        highlightWord(x, y);
                    }
                }
                input.focus();
            });

            input.addEventListener('focus', (e) => {
                if (!currentCell || currentCell.x !== x || currentCell.y !== y) {
                    currentCell = { x, y };
                    if (cellData.hWordId && !cellData.vWordId) currentDir = 'H';
                    else if (!cellData.hWordId && cellData.vWordId) currentDir = 'V';
                    highlightWord(x, y);
                }
                e.target.select();
            });

            input.addEventListener('input', (e) => {
                let val = e.target.value.toUpperCase();
                if (!/^[А-ЯЁ]$/.test(val)) {
                    e.target.value = '';
                    return;
                }
                e.target.value = val;
                checkWin();
                moveToNextCell(1);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (e.target.value === '') {
                        e.preventDefault();
                        moveToNextCell(-1);
                        setTimeout(() => {
                            if (currentCell) {
                                document.getElementById(`input-${currentCell.x}-${currentCell.y}`).value = '';
                            }
                        }, 10);
                    }
                } else if (e.key === 'ArrowUp') { moveFocus(0, -1); e.preventDefault(); }
                else if (e.key === 'ArrowDown') { moveFocus(0, 1); e.preventDefault(); }
                else if (e.key === 'ArrowLeft') { moveFocus(-1, 0); e.preventDefault(); }
                else if (e.key === 'ArrowRight') { moveFocus(1, 0); e.preventDefault(); }
            });

            wrapper.appendChild(input);
        } else {
            wrapper.classList.add('empty');
        }
        board.appendChild(wrapper);
    }
}

function highlightWord(x, y) {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('active-word', 'active-cell'));
    document.querySelectorAll('.clue-list li').forEach(li => li.classList.remove('active-clue'));

    const cd = gridModel[y][x];
    if (!cd) return;

    let wordId = currentDir === 'H' ? cd.hWordId : cd.vWordId;
    if (!wordId) {
        currentDir = currentDir === 'H' ? 'V' : 'H';
        wordId = currentDir === 'H' ? cd.hWordId : cd.vWordId;
    }

    const wordInfo = crosswordData.find(w => w.id === wordId);
    if (wordInfo) {
        let cx = wordInfo.x, cy = wordInfo.y;
        for (let i = 0; i < wordInfo.answer.length; i++) {
            document.getElementById(`cell-${cx}-${cy}`)?.classList.add('active-word');
            wordInfo.dir === 'H' ? cx++ : cy++;
        }
        document.getElementById(`clue-${wordId}`)?.classList.add('active-clue');
    }
    document.getElementById(`cell-${x}-${y}`)?.classList.add('active-cell');
}

function moveToNextCell(step) {
    let nx = currentCell.x + (currentDir === 'H' ? step : 0);
    let ny = currentCell.y + (currentDir === 'V' ? step : 0);
    document.getElementById(`input-${nx}-${ny}`)?.focus();
}

function moveFocus(dx, dy) {
    let nx = currentCell.x + dx;
    let ny = currentCell.y + dy;
    const nextInput = document.getElementById(`input-${nx}-${ny}`);
    if (nextInput) {
        if (dx !== 0) currentDir = 'H';
        if (dy !== 0) currentDir = 'V';
        nextInput.focus();
    }
}

function checkWin() {
    let win = true;
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cd = gridModel[y][x];
            if (cd && cd.char) {
                const input = document.getElementById(`input-${x}-${y}`);
                if (!input || input.value.toUpperCase() !== cd.char.toUpperCase()) {
                    win = false;
                    break;
                }
            }
        }
        if (!win) break;
    }
    if (win) {
        setTimeout(() => {
            document.getElementById('win-modal').classList.remove('hidden');
        }, 300);
    }
}
