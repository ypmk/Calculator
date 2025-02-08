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


function appendToDisplay(value) {
    fullExpression += value;
    saveToLocalStorage();
    updateDisplay();
}

function updateDisplay() {
    const maxLength = 18;
    display.innerText = fullExpression.length > maxLength
        ? fullExpression.slice(-maxLength)
        : fullExpression;
}

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

function deleteLast() {
    fullExpression = fullExpression.slice(0, -1);
    saveToLocalStorage();
    updateDisplay();
}

function clearDisplay() {
    fullExpression = "";
    saveToLocalStorage();
    updateDisplay();
}

function saveToLocalStorage() {
    localStorage.setItem('calculatorExpression', fullExpression);
}

window.onload = () => {
    const savedValue = localStorage.getItem('calculatorExpression');
    if (savedValue) {
        fullExpression = savedValue;
        updateDisplay();
    }
};

/** 
 * 🔹 Функция вычисления выражения через стек (RPN)
 */
function evaluateExpression(expression) {
    const outputQueue = [];
    const operatorStack = [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
    const associativity = { "+": "L", "-": "L", "*": "L", "/": "L", "^": "R" };

    // Разбираем выражение на токены
    const tokens = expression.match(/(\d+(\.\d+)?|\+|\-|\*|\/|\^|\(|\))/g);
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

/** 
 * 🔹 Вычисление выражения в обратной польской нотации (RPN)
 */
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
