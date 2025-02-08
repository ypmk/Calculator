const display = document.getElementById('display');

// Загружаем сохраненное значение из LocalStorage при загрузке страницы
window.onload = () => {
    const savedValue = localStorage.getItem('calculatorDisplay');
    if (savedValue) display.innerText = savedValue;
};

// Обработчик нажатий с клавиатуры
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9+\-*/().^]/.test(key)) {
        appendToDisplay(key);
    } else if (key === 'Enter') {
        calculate();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});

// Функция добавления символов в дисплей
function appendToDisplay(value) {
    display.innerText += value;
    saveToLocalStorage();
}

// Функция очистки дисплея
function clearDisplay() {
    display.innerText = '';
    saveToLocalStorage();
}

// Функция удаления последнего символа
function deleteLast() {
    display.innerText = display.innerText.slice(0, -1);
    saveToLocalStorage();
}

// Функция сохранения в LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('calculatorDisplay', display.innerText);
}

// Функция вычисления выражения
function calculate() {
    try {
        let expression = display.innerText.replace(/\^/g, '**');
        const result = evaluateExpression(expression);
        display.innerText = result;
        saveToLocalStorage();
    } catch (error) {
        display.innerText = 'Ошибка';
    }
}

// Функция преобразования в обратную польскую нотацию (RPN)
function toRPN(expression) {
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '**': 3 };
    const associativity = { '+': 'L', '-': 'L', '*': 'L', '/': 'L', '**': 'R' };
    const tokens = expression.match(/(\d+(\.\d+)?)|[\+\-\*\/\^\(\)]/g);
    if (!tokens) throw new Error("Неверное выражение");

    for (let token of tokens) {
        if (!isNaN(token)) {
            outputQueue.push(parseFloat(token));
        } else if (token in precedence) {
            while (operatorStack.length &&
                operatorStack[operatorStack.length - 1] !== '(' &&
                (
                    (associativity[token] === 'L' && precedence[token] <= precedence[operatorStack[operatorStack.length - 1]]) ||
                    (associativity[token] === 'R' && precedence[token] < precedence[operatorStack[operatorStack.length - 1]])
                )) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token === '(') {
            operatorStack.push(token);
        } else if (token === ')') {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.pop();
        }
    }

    while (operatorStack.length) {
        outputQueue.push(operatorStack.pop());
    }

    return outputQueue;
}

// Функция вычисления выражения в RPN
function evaluateRPN(rpnQueue) {
    const stack = [];
    for (let token of rpnQueue) {
        if (!isNaN(token)) {
            stack.push(token);
        } else {
            let b = stack.pop();
            let a = stack.pop();
            switch (token) {
                case '+': stack.push(a + b); break;
                case '-': stack.push(a - b); break;
                case '*': stack.push(a * b); break;
                case '/': stack.push(a / b); break;
                case '**': stack.push(Math.pow(a, b)); break;
                default: throw new Error("Неизвестный оператор");
            }
        }
    }
    return stack.pop();
}

// Функция вычисления выражения
function evaluateExpression(expression) {
    return evaluateRPN(toRPN(expression));
}

// Обработка кликов по кнопкам калькулятора
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.innerText;
        if (value === '=') {
            calculate();
        } else if (value === 'C') {
            clearDisplay();
        } else if (value === '⌫') {
            deleteLast();
        } else {
            appendToDisplay(value);
        }
    });
});
