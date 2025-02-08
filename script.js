const display = document.getElementById('display');
let fullExpression = "";

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

// Функция добавления символов в дисплей
function appendToDisplay(value) {
    fullExpression += value;
    saveToLocalStorage();
    updateDisplay();
}

// Функция обновления данных на дисплее
function updateDisplay() {
    const maxLength = 18;
    display.innerText = fullExpression.length > maxLength
        ? fullExpression.slice(-maxLength)
        : fullExpression;
}

// Функция вычисления выражения
function calculate() {
    try {
        let result = evaluateExpression(fullExpression);
        fullExpression = result.toString();
        saveToLocalStorage();
        updateDisplay();
    } catch (error) {
        display.innerText = 'Ошибка';
        fullExpression = "";
    }
}

// Функция удаления последнего символа
function deleteLast() {
    fullExpression = fullExpression.slice(0, -1);
    saveToLocalStorage();
    updateDisplay();
}

// Функция очистки дисплея
function clearDisplay() {
    fullExpression = "";
    saveToLocalStorage();
    updateDisplay();
}

// Функция сохранения в LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('calculatorExpression', fullExpression);
}

// Загружаем сохраненное значение из LocalStorage при загрузке страницы
window.onload = () => {
    const savedValue = localStorage.getItem('calculatorExpression');
    if (savedValue) {
        fullExpression = savedValue;
        updateDisplay();
    }
};

// Функция вычисления выражения через стек (RPN)
function evaluateExpression(expression) {
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
    const associativity = { "+": "L", "-": "L", "*": "L", "/": "L", "^": "R" };

    // Разбираем выражение на токены
    // Обрабатываем минус перед числом как часть числа, если это первое число или после открывающейся скобки
    const tokens = expression
        .replace(/([^\d\-+*/()^])(-)/g, '$1 $2')  // Пробел перед минусом, если это не оператор
        .replace(/(^|\()(-)/g, '$1 0$2')  // Обрабатываем минус, если это первое число или после скобки
        .match(/(\d+(\.\d+)?|\+|\-|\*|\/|\^|\(|\))/g);  // Разбираем на токены

    if (!tokens) throw new Error("Некорректное выражение");

    for (const token of tokens) {
        if (!isNaN(token)) {
            outputQueue.push(parseFloat(token));
        } else if (token in precedence) {
            while (
                operatorStack.length &&
                precedence[operatorStack[operatorStack.length - 1]] >= precedence[token] &&
                associativity[token] === "L"
            ) {
                outputQueue.push(operatorStack.pop());
            }
            operatorStack.push(token);
        } else if (token === "(") {
            operatorStack.push(token);
        } else if (token === ")") {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== "(") {
                outputQueue.push(operatorStack.pop());
            }
            if (operatorStack.length && operatorStack[operatorStack.length - 1] === "(") {
                operatorStack.pop();
            } else {
                throw new Error("Несоответствие скобок");
            }
        }
    }

    while (operatorStack.length) {
        const op = operatorStack.pop();
        if (op === "(" || op === ")") throw new Error("Несоответствие скобок");
        outputQueue.push(op);
    }

    return evaluateRPN(outputQueue);
}

// Вычисление выражения в обратной польской нотации (RPN)
function evaluateRPN(queue) {
    const stack = [];

    for (const token of queue) {
        if (typeof token === "number") {
            stack.push(token);
        } else {
            if (stack.length < 2) throw new Error("Ошибка вычисления");
            const b = stack.pop();
            const a = stack.pop();
            let result;

            switch (token) {
                case "+": result = a + b; break;
                case "-": result = a - b; break;
                case "*": result = a * b; break;
                case "/":
                    if (b === 0) throw new Error("Деление на 0");
                    result = a / b;
                    break;
                case "^": result = Math.pow(a, b); break;
                default: throw new Error("Неизвестный оператор");
            }

            stack.push(result);
        }
    }

    if (stack.length !== 1) throw new Error("Ошибка вычисления");
    return stack[0];
}
