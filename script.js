// Данные слов и их точные позиции в сетке
const crosswordData = [
    { id: 1, answer: "ПЕТЕРБУРГ", clue: "Город, военным генерал-губернатором которого был Милорадович с 1818 года.", dir: "H", x: 2, y: 2 },
    { id: 2, answer: "СЕНАТСКАЯ", clue: "Площадь, ставшая местом рокового выстрела в Милорадовича.", dir: "V", x: 3, y: 1 },
    { id: 3, answer: "КАХОВСКИЙ", clue: "Фамилия декабриста, нанесшего смертельное ранение генералу.", dir: "H", x: 3, y: 7 },
    { id: 4, answer: "СУВОРОВ", clue: "Великий полководец, сподвижником которого был Милорадович в Итальянском и Швейцарском походах.", dir: "V", x: 6, y: 4 },
    { id: 5, answer: "АВАНГАРД", clue: "Передовой отряд войск, которым Милорадович блестяще командовал при преследовании Наполеона.", dir: "H", x: 5, y: 10 },
    { id: 6, answer: "ДЕКАБРЬ", clue: "Месяц 1825 года, когда произошло восстание, стоившее Милорадовичу жизни.", dir: "V", x: 12, y: 10 },
    { id: 7, answer: "БОРОДИНО", clue: "Знаменитое сражение, где Михаил Андреевич командовал войсками правого крыла Первой армии.", dir: "H", x: 12, y: 14 },
    { id: 8, answer: "СЕРБИЯ", clue: "Историческая родина предков рода Милорадовичей.", dir: "V", x: 9, y: 0 },
    { id: 9, answer: "ГРАФ", clue: "Высокий дворянский титул, пожалованный Милорадовичу в 1813 году за военные заслуги.", dir: "V", x: 10, y: 2 },
    { id: 10, answer: "ЛЕЙПЦИГ", clue: "Город, под которым состоялась знаменитая «Битва народов».", dir: "V", x: 17, y: 9 },
    { id: 11, answer: "МЮРАТ", clue: "«Русский ...» — так называли Милорадовича за храбрость, сравнивая с французским маршалом.", dir: "V", x: 11, y: 8 }
];

const gridWidth = 20;
const gridHeight = 17;
let gridModel = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(null));

let currentDir = 'H';
let currentCell = null;

// Инициализация модальных окон
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
        if (i === 0) gridModel[cy][cx].number = w.id;
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
    li.innerText = `${w.id}. ${w.clue}`;
    li.id = `clue-${w.id}`;
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
            // Номер клетки
            if (cellData.number) {
                const numEl = document.createElement('div');
                numEl.className = 'number';
                numEl.innerText = cellData.number;
                wrapper.appendChild(numEl);
            }

            // Поле для ввода
            const input = document.createElement('input');
            input.id = `input-${x}-${y}`;
            input.maxLength = 1;
            input.autocomplete = "off";

            // Логика фокуса и клика
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

            // Ввод текста
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

            // Навигация с клавиатуры
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

// Подсветка активного слова и вопроса
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

// Перемещение фокуса на шаг
function moveToNextCell(step) {
    let nx = currentCell.x + (currentDir === 'H' ? step : 0);
    let ny = currentCell.y + (currentDir === 'V' ? step : 0);
    document.getElementById(`input-${nx}-${ny}`)?.focus();
}

// Перемещение фокуса по стрелкам
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

// Проверка выигрыша (срабатывает после каждого ввода)
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
        }, 300); // Небольшая задержка перед окном
    }
}
