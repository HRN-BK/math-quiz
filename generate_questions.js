const fs = require('fs');
const path = require('path');

const questions = [];
let qCount = 0;
const addQ = (q) => { questions.push(q); qCount++; };

function generateOptions(ansN, ansD, isString = false) {
    let opts = [];
    if (isString) {
        opts.push({ id: "A", type: "text", value: ansN });
    } else {
        opts.push({ id: "A", type: "fraction", value: { numerator: ansN, denominator: ansD } });
    }
    
    const distractors = new Set();
    distractors.add(isString ? ansN : `${ansN}/${ansD}`);
    
    const addDistractor = (n, d) => {
        if (!isString && (n <= 0 || d <= 0)) return;
        const key = isString ? n : `${n}/${d}`;
        if (!distractors.has(key) && opts.length < 4) {
            distractors.add(key);
            if (isString) {
                opts.push({ id: "", type: "text", value: n });
            } else {
                opts.push({ id: "", type: "fraction", value: { numerator: n, denominator: d } });
            }
        }
    };
    
    if (isString) {
        let numStr = String(ansN);
        let numVal = parseFloat(numStr);
        let unitStr = numStr.replace(numVal.toString(), "");
        if (!isNaN(numVal)) {
            addDistractor(`${numVal + 1}${unitStr}`); addDistractor(`${Math.max(0, numVal - 1)}${unitStr}`);
            addDistractor(`${numVal + 10}${unitStr}`); addDistractor(`${numVal * 2}${unitStr}`);
            let fallback = 2; while(opts.length < 4) { addDistractor(`${numVal + fallback}${unitStr}`); fallback++; }
        }
    } else {
        addDistractor(ansN + 1, ansD); addDistractor(Math.max(1, ansN - 1), ansD);
        addDistractor(ansN, ansD + 2); addDistractor(ansN + 2, ansD);
        let fallback = 1; while(opts.length < 4) { addDistractor(ansN + fallback, ansD + fallback); fallback++; }
    }
    return opts;
}

// 1. FRACTIONS (200)
for(let i=0; i<40; i++) {
    let d = Math.floor(Math.random() * 10) + 3; 
    let n1 = Math.floor(Math.random() * (d-1)) + 1;
    let n2 = Math.floor(Math.random() * (d-1)) + 1;
    addQ({
        id: `q_frac_add_${i}`, type: "multiple-choice", topic: "fraction", difficulty: "easy",
        question: "Tính tổng:", fractions: [ { numerator: n1, denominator: d }, { operator: "+" }, { numerator: n2, denominator: d } ],
        options: generateOptions(n1+n2, d), correctAnswerId: "", explanation: "Cộng tử số với nhau và giữ nguyên mẫu số."
    });

    d = Math.floor(Math.random() * 10) + 3; 
    n1 = Math.floor(Math.random() * (d-1)) + 1;
    n2 = Math.floor(Math.random() * (d-1)) + 1;
    if (n1 < n2) { let t = n1; n1 = n2; n2 = t; }
    if (n1 === n2) n1 += 1;
    addQ({
        id: `q_frac_sub_${i}`, type: "multiple-choice", topic: "fraction", difficulty: "easy",
        question: "Thực hiện phép trừ:", fractions: [ { numerator: n1, denominator: d }, { operator: "-" }, { numerator: n2, denominator: d } ],
        options: generateOptions(n1-n2, d), correctAnswerId: "", explanation: "Trừ tử số với nhau và giữ nguyên mẫu số."
    });

    let d1 = Math.floor(Math.random() * 6) + 2; let d2 = Math.floor(Math.random() * 6) + 2; 
    n1 = Math.floor(Math.random() * (d1-1)) + 1; n2 = Math.floor(Math.random() * (d2-1)) + 1;
    addQ({
        id: `q_frac_mul_${i}`, type: "multiple-choice", topic: "fraction", difficulty: "medium",
        question: "Thực hiện phép nhân:", fractions: [ { numerator: n1, denominator: d1 }, { operator: "×" }, { numerator: n2, denominator: d2 } ],
        options: generateOptions(n1*n2, d1*d2), correctAnswerId: "", explanation: "Nhân tử số với tử số, mẫu số với mẫu số."
    });
}

for(let i=0; i<30; i++) {
    let d = Math.floor(Math.random() * 8) + 3; 
    let n1 = Math.floor(Math.random() * (d-1)) + 1; let n2 = Math.floor(Math.random() * (d-1)) + 1;
    let opType = Math.floor(Math.random() * 3); 
    let ansN, ansD, opStr, expStr;
    if (opType === 0) { ansN = n1 + n2; ansD = d; opStr = "+"; expStr = "Cộng tử số với nhau và giữ nguyên mẫu số."; }
    else if (opType === 1) { if (n1 < n2) { let t = n1; n1 = n2; n2 = t; } if (n1 === n2) n1 += 1; ansN = n1 - n2; ansD = d; opStr = "-"; expStr = "Trừ tử số với nhau và giữ nguyên mẫu số."; }
    else { let d2 = Math.floor(Math.random() * 5) + 2; let nMul2 = Math.floor(Math.random() * (d2-1)) + 1; ansN = n1 * nMul2; ansD = d * d2; opStr = "×"; expStr = "Nhân tử số với tử số, mẫu số với mẫu số."; n2 = nMul2; d = d2; }
    addQ({
        id: `q_frac_dd_res_${i}`, type: "drag-drop", topic: "fraction", difficulty: "medium",
        question: "Kéo thả phân số kết quả vào đúng vị trí:",
        equationLayout: [ { type: "fraction", value: { numerator: n1, denominator: opType === 2 ? (ansD/d) : ansD } }, { type: "text", value: opStr }, { type: "fraction", value: { numerator: n2, denominator: d } }, { type: "text", value: "=" }, { type: "dropzone", id: "result_zone" } ],
        dragItems: [ { id: "correct", type: "fraction", value: { numerator: ansN, denominator: ansD } }, { id: "wrong1", type: "fraction", value: { numerator: ansN + 1, denominator: ansD } }, { id: "wrong2", type: "fraction", value: { numerator: Math.max(1, ansN - 1), denominator: ansD } } ].sort(() => 0.5 - Math.random()),
        dropZones: [ { id: "result_zone", expectedItemId: "correct", label: "?" } ], explanation: expStr
    });
}

for(let i=0; i<30; i++) {
    let d = Math.floor(Math.random() * 8) + 3; 
    let n1 = Math.floor(Math.random() * (d-1)) + 1; let n2 = Math.floor(Math.random() * (d-1)) + 1;
    let opType = Math.floor(Math.random() * 3); 
    let ansN, ansD, correctOp, expStr;
    if (opType === 0) { if (n1 === n2) n1 += 1; ansN = n1 + n2; ansD = d; correctOp = "+"; expStr = "Tử số tăng lên, nên đây phải là phép cộng."; }
    else if (opType === 1) { if (n1 < n2) { let t = n1; n1 = n2; n2 = t; } if (n1 === n2) n1 += 1; ansN = n1 - n2; ansD = d; correctOp = "-"; expStr = "Tử số giảm đi, nên đây phải là phép trừ."; }
    else { let d2 = Math.floor(Math.random() * 5) + 2; let nMul2 = Math.floor(Math.random() * (d2-1)) + 1; ansN = n1 * nMul2; ansD = d * d2; correctOp = "×"; expStr = "Mẫu số và tử số đều thay đổi, nên đây phải là phép nhân."; n2 = nMul2; d = d2; }
    addQ({
        id: `q_frac_dd_op_${i}`, type: "drag-drop", topic: "fraction", difficulty: "medium",
        question: "Kéo thả dấu phép tính thích hợp vào ô trống:",
        equationLayout: [ { type: "fraction", value: { numerator: n1, denominator: opType === 2 ? (ansD/d) : ansD } }, { type: "dropzone", id: "op_zone" }, { type: "fraction", value: { numerator: n2, denominator: d } }, { type: "text", value: "=" }, { type: "fraction", value: { numerator: ansN, denominator: ansD } } ],
        dragItems: [ { id: "plus", type: "operator", value: "+" }, { id: "minus", type: "operator", value: "-" }, { id: "multiply", type: "operator", value: "×" } ].sort(() => 0.5 - Math.random()),
        dropZones: [ { id: "op_zone", expectedItemId: correctOp === "+" ? "plus" : (correctOp === "-" ? "minus" : "multiply"), label: "?" } ], explanation: expStr
    });
}

for(let i=0; i<20; i++) {
    let d = Math.floor(Math.random() * 5) + 5; 
    let n1 = Math.floor(Math.random() * (d-1)) + 1; let n2 = Math.floor(Math.random() * (d-1)) + 1; let n3 = Math.floor(Math.random() * (d-1)) + 1;
    let ansN = n1 + n2 - n3; if (ansN <= 0) { n3 = 1; ansN = n1 + n2 - n3; }
    addQ({
        id: `q_frac_hard_${i}`, type: "multiple-choice", topic: "fraction", difficulty: "hard",
        question: "Thực hiện phép tính kết hợp:", fractions: [ { numerator: n1, denominator: d }, { operator: "+" }, { numerator: n2, denominator: d }, { operator: "-" }, { numerator: n3, denominator: d } ],
        options: generateOptions(ansN, d), correctAnswerId: "", explanation: "Thực hiện phép cộng và trừ tuần tự từ trái sang phải."
    });
}

// 2. GEOMETRY (200)
const geomShapes = ["rectangle", "square", "triangle", "trapezoid", "circle"];
const geomUnits = ["cm", "m", "dm"];
for(let i=0; i<200; i++) {
    let shape = geomShapes[Math.floor(Math.random() * geomShapes.length)];
    let unit = geomUnits[Math.floor(Math.random() * geomUnits.length)];
    let isArea = Math.random() > 0.5;
    let isHard = Math.random() > 0.7;
    let diff = isHard ? "hard" : (isArea ? "medium" : "easy");
    let geomData = { shape, unit };
    let questionStr = "", ansVal = 0, expStr = "";
    let ansUnit = isArea ? `${unit}²` : unit;

    if (shape === "rectangle") {
        let w = Math.floor(Math.random() * 15) + 5; let h = Math.floor(Math.random() * (w-1)) + 2; 
        geomData.width = w; geomData.height = h;
        if (isHard && isArea) {
            ansVal = w; ansUnit = unit; geomData.area = w * h; delete geomData.width;
            questionStr = `Một hình chữ nhật có diện tích ${w*h}${unit}² và chiều rộng ${h}${unit}. Tính chiều dài:`; expStr = `Chiều dài = Diện tích ÷ Chiều rộng = ${w*h} ÷ ${h} = ${ansVal} ${ansUnit}.`;
        } else {
            questionStr = isArea ? "Tính diện tích của hình chữ nhật dưới đây:" : "Tính chu vi của hình chữ nhật dưới đây:";
            ansVal = isArea ? (w * h) : ((w + h) * 2);
            expStr = isArea ? `Diện tích = Dài × Rộng = ${w} × ${h} = ${ansVal} ${ansUnit}.` : `Chu vi = (Dài + Rộng) × 2 = ${ansVal} ${ansUnit}.`;
        }
    } 
    else if (shape === "square") {
        let s = Math.floor(Math.random() * 15) + 3; geomData.side = s;
        if (isHard && !isArea) {
            ansVal = s; ansUnit = unit; geomData.perimeter = s * 4; delete geomData.side;
            questionStr = `Một hình vuông có chu vi ${s*4}${unit}. Tính độ dài 1 cạnh:`; expStr = `Cạnh = Chu vi ÷ 4 = ${s*4} ÷ 4 = ${ansVal} ${ansUnit}.`;
        } else {
            questionStr = isArea ? "Tính diện tích của hình vuông dưới đây:" : "Tính chu vi của hình vuông dưới đây:";
            ansVal = isArea ? (s * s) : (s * 4); expStr = isArea ? `Diện tích = Cạnh × Cạnh = ${ansVal} ${ansUnit}.` : `Chu vi = Cạnh × 4 = ${ansVal} ${ansUnit}.`;
        }
    }
    else if (shape === "triangle") {
        let base = Math.floor(Math.random() * 15) + 4; let h = Math.floor(Math.random() * 10) + 3;
        geomData.base = base; geomData.height = h; ansUnit = `${unit}²`;
        if (isHard) {
            ansVal = base; ansUnit = unit; geomData.area = (base * h) / 2; delete geomData.base;
            questionStr = `Tam giác có diện tích ${geomData.area}${unit}² và chiều cao ${h}${unit}. Tính cạnh đáy:`; expStr = `Đáy = (Diện tích × 2) ÷ Chiều cao = (${geomData.area} × 2) ÷ ${h} = ${ansVal} ${ansUnit}.`;
        } else {
            questionStr = "Tính diện tích của hình tam giác có đáy và chiều cao như hình:"; ansVal = (base * h) / 2; expStr = `Diện tích = (Đáy × Chiều cao) ÷ 2 = ${ansVal} ${ansUnit}.`;
        }
    }
    else if (shape === "trapezoid") {
        let base1 = Math.floor(Math.random() * 8) + 3; let base2 = base1 + Math.floor(Math.random() * 6) + 2; let h = Math.floor(Math.random() * 10) + 3;
        geomData.base1 = base1; geomData.base2 = base2; geomData.height = h; ansUnit = `${unit}²`;
        questionStr = "Tính diện tích của hình thang dưới đây:"; ansVal = ((base1 + base2) * h) / 2; expStr = `Diện tích = (Đáy lớn + Đáy bé) × Chiều cao ÷ 2 = ${ansVal} ${ansUnit}.`;
    }
    else if (shape === "circle") {
        let r = Math.floor(Math.random() * 10) + 2; geomData.radius = r;
        questionStr = isArea ? "Tính diện tích hình tròn (lấy π = 3,14):" : "Tính chu vi hình tròn (lấy π = 3,14):";
        ansVal = isArea ? (r * r * 3.14) : (r * 2 * 3.14); ansVal = Math.round(ansVal * 100) / 100;
        expStr = isArea ? `Diện tích = r × r × 3,14 = ${ansVal} ${ansUnit}.` : `Chu vi = r × 2 × 3,14 = ${ansVal} ${ansUnit}.`;
    }
    addQ({
        id: `q_gen_geom_${i}`, type: "multiple-choice", topic: "geometry", difficulty: diff,
        question: questionStr, geometry: geomData, options: generateOptions(`${ansVal} ${ansUnit}`, 1, true), correctAnswerId: "", explanation: expStr
    });
}

// 3. BASIC ARITHMETIC 1-DIGIT (100)
for(let i=0; i<100; i++) {
    let opType = Math.floor(Math.random() * 5); 
    let n1, n2, n3, ansVal, arith, expStr;
    let diff = opType < 2 ? "easy" : (opType < 4 ? "medium" : "hard");
    if (opType === 0) { n1 = Math.floor(Math.random() * 9) + 1; n2 = Math.floor(Math.random() * 9) + 1; ansVal = n1 + n2; arith = `${n1} + ${n2} = ?`; expStr = `${n1} cộng ${n2} bằng ${ansVal}.`; }
    else if (opType === 1) { n1 = Math.floor(Math.random() * 9) + 1; n2 = Math.floor(Math.random() * 9) + 1; if (n1 < n2) { let t = n1; n1 = n2; n2 = t; } ansVal = n1 - n2; arith = `${n1} - ${n2} = ?`; expStr = `${n1} trừ ${n2} bằng ${ansVal}.`; }
    else if (opType === 2) { n1 = Math.floor(Math.random() * 9) + 1; n2 = Math.floor(Math.random() * 9) + 1; ansVal = n1 * n2; arith = `${n1} × ${n2} = ?`; expStr = `${n1} nhân ${n2} bằng ${ansVal}.`; }
    else if (opType === 3) { n2 = Math.floor(Math.random() * 9) + 1; let ans = Math.floor(Math.random() * 9) + 1; n1 = n2 * ans; ansVal = ans; arith = `${n1} ÷ ${n2} = ?`; expStr = `${n1} chia ${n2} bằng ${ansVal}.`; }
    else { n1 = Math.floor(Math.random() * 5) + 1; n2 = Math.floor(Math.random() * 5) + 1; n3 = Math.floor(Math.random() * 5) + 1; ansVal = n1 + (n2 * n3); arith = `${n1} + ${n2} × ${n3} = ?`; expStr = `Nhân chia trước, cộng trừ sau: ${n2} × ${n3} = ${n2*n3}, sau đó ${n1} + ${n2*n3} = ${ansVal}.`; }
    addQ({
        id: `q_gen_basic1_${i}`, type: "multiple-choice", topic: "basic_1_digit", difficulty: diff,
        question: "Thực hiện phép tính:", arithmetic: arith, options: generateOptions(`${ansVal}`, 1, true), correctAnswerId: "", explanation: expStr
    });
}

// 4. BASIC ARITHMETIC 2-DIGIT (100)
for(let i=0; i<100; i++) {
    let opType = Math.floor(Math.random() * 5); 
    let n1, n2, ansVal, arith, expStr;
    let isDivWithRemainder = false;
    let opts = [];
    let diff = opType < 2 ? "easy" : (opType === 2 ? "medium" : "hard");
    if (opType === 0) { n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 90) + 10; ansVal = n1 + n2; arith = `${n1} + ${n2} = ?`; expStr = `${n1} cộng ${n2} bằng ${ansVal}.`; opts = generateOptions(`${ansVal}`, 1, true); }
    else if (opType === 1) { n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 90) + 10; if (n1 < n2) { let t = n1; n1 = n2; n2 = t; } ansVal = n1 - n2; arith = `${n1} - ${n2} = ?`; expStr = `${n1} trừ ${n2} bằng ${ansVal}.`; opts = generateOptions(`${ansVal}`, 1, true); }
    else if (opType === 2) { n1 = Math.floor(Math.random() * 90) + 10; n2 = Math.floor(Math.random() * 9) + 2; ansVal = n1 * n2; arith = `${n1} × ${n2} = ?`; expStr = `${n1} nhân ${n2} bằng ${ansVal}.`; opts = generateOptions(`${ansVal}`, 1, true); }
    else if (opType === 4) { n1 = Math.floor(Math.random() * 50) + 10; ansVal = Math.floor(Math.random() * 50) + 10; let sum = n1 + ansVal; arith = `X + ${n1} = ${sum}`; expStr = `Muốn tìm số hạng chưa biết (X), ta lấy Tổng trừ đi số hạng đã biết: X = ${sum} - ${n1} = ${ansVal}.`; opts = generateOptions(`${ansVal}`, 1, true); }
    else { n2 = Math.floor(Math.random() * 8) + 2; ansVal = Math.floor(Math.random() * 10) + 2; let rem = Math.floor(Math.random() * (n2 - 1)) + 1; n1 = n2 * ansVal + rem; isDivWithRemainder = true; arith = `${n1} ÷ ${n2} = ?`; expStr = `${n1} chia ${n2} được thương là ${ansVal}, dư ${rem}.`; opts.push({ id: "A", type: "text", value: `Thương: ${ansVal}, dư: ${rem}` }); const distractors = new Set([`${ansVal}-${rem}`]); const addDivD = (q, r) => { if (q < 0 || r < 0 || r >= n2) return; if (!distractors.has(`${q}-${r}`) && opts.length < 4) { distractors.add(`${q}-${r}`); opts.push({ id: "", type: "text", value: `Thương: ${q}, dư: ${r}` }); } }; addDivD(ansVal, rem + 1); addDivD(ansVal + 1, rem); addDivD(ansVal - 1, rem); addDivD(ansVal, rem - 1); let fb = 2; while(opts.length < 4) { addDivD(ansVal + Math.floor(fb/2), (rem + fb) % n2); fb++; } }
    addQ({
        id: `q_gen_basic2_${i}`, type: "multiple-choice", topic: "basic_2_digit", difficulty: diff,
        question: opType === 4 ? "Tìm X:" : (isDivWithRemainder ? "Thực hiện phép chia có dư:" : "Thực hiện phép tính:"),
        arithmetic: arith, options: opts, correctAnswerId: "", explanation: expStr
    });
}

questions.forEach(q => {
    if (q.type === 'multiple-choice') {
        const correctVal = q.options[0].value;
        const opts = [...q.options];
        for (let j = opts.length - 1; j > 0; j--) { const k = Math.floor(Math.random() * (j + 1)); [opts[j], opts[k]] = [opts[k], opts[j]]; }
        const labels = ["A", "B", "C", "D"]; let correctId = "";
        opts.forEach((o, index) => {
            o.id = labels[index];
            if (o.type === 'fraction' && correctVal && typeof correctVal === 'object') { if (o.value.numerator === correctVal.numerator && o.value.denominator === correctVal.denominator) correctId = o.id; }
            else { if (o.value === correctVal) correctId = o.id; }
        });
        q.options = opts; q.correctAnswerId = correctId;
    }
});

const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)){ fs.mkdirSync(dataDir, { recursive: true }); }
fs.writeFileSync(path.join(dataDir, 'questions.json'), JSON.stringify(questions, null, 2));

console.log(`\n✅ Validate thành công! Đã kiểm tra ${questions.length} câu hỏi có gắn nhãn difficulty.`);
console.log(`✅ Đã ghi file questions.json thành công với ${questions.length} câu hỏi chuẩn xác.\n`);
