const fs = require('fs');
const path = require('path');

function validateQuestions(questions) {
    let errors = [];

    questions.forEach((q, idx) => {
        const qNum = idx + 1;
        const qId = q.id;

        // Common validation
        if (!q.id) errors.push(`[Q${qNum}] Thiếu 'id'`);
        if (!q.type) errors.push(`[Q${qNum} - ${qId}] Thiếu 'type'`);
        if (!q.topic) errors.push(`[Q${qNum} - ${qId}] Thiếu 'topic'`);
        if (!q.question) errors.push(`[Q${qNum} - ${qId}] Thiếu 'question' text`);

        // Type specific validation
        if (q.type === 'multiple-choice') {
            if (!q.options || q.options.length !== 4) {
                errors.push(`[Q${qNum} - ${qId}] Không đủ 4 lựa chọn (có ${q.options?.length || 0})`);
            } else {
                // Check for duplicates
                const optValues = new Set();
                q.options.forEach(opt => {
                    let valStr = '';
                    if (opt.type === 'fraction') {
                        valStr = `${opt.value.numerator}/${opt.value.denominator}`;
                        if (opt.value.denominator <= 0) {
                            errors.push(`[Q${qNum} - ${qId}] Mẫu số không hợp lệ (<= 0) trong đáp án ${opt.id}`);
                        }
                    } else {
                        valStr = String(opt.value);
                    }
                    if (optValues.has(valStr)) {
                        errors.push(`[Q${qNum} - ${qId}] Trùng lặp đáp án: ${valStr}`);
                    }
                    optValues.add(valStr);
                });

                // Check correctAnswerId
                if (!q.correctAnswerId) {
                    errors.push(`[Q${qNum} - ${qId}] Thiếu correctAnswerId`);
                } else {
                    const hasCorrect = q.options.find(o => o.id === q.correctAnswerId);
                    if (!hasCorrect) {
                        errors.push(`[Q${qNum} - ${qId}] correctAnswerId '${q.correctAnswerId}' không khớp với bất kỳ đáp án nào`);
                    }
                }
            }
        } else if (q.type === 'drag-drop') {
            if (!q.dragItems || q.dragItems.length === 0) {
                errors.push(`[Q${qNum} - ${qId}] Không có dragItems`);
            }
            if (!q.dropZones || q.dropZones.length === 0) {
                errors.push(`[Q${qNum} - ${qId}] Không có dropZones`);
            } else {
                const dragItemIds = new Set(q.dragItems.map(d => d.id));
                q.dropZones.forEach(zone => {
                    if (!dragItemIds.has(zone.expectedItemId)) {
                        errors.push(`[Q${qNum} - ${qId}] dropZone yêu cầu item '${zone.expectedItemId}' nhưng không tồn tại trong dragItems`);
                    }
                });
            }

            // check duplicate drag items
            if (q.dragItems) {
                const dragValues = new Set();
                q.dragItems.forEach(item => {
                    let valStr = '';
                    if (item.type === 'fraction') {
                        valStr = `${item.value.numerator}/${item.value.denominator}`;
                    } else {
                        valStr = String(item.value);
                    }
                    if (dragValues.has(valStr)) {
                        errors.push(`[Q${qNum} - ${qId}] Trùng lặp mục kéo thả: ${valStr}`);
                    }
                    dragValues.add(valStr);
                });
            }
        }

        // Topic specific validation
        if (q.topic === 'geometry' && q.geometry) {
            const g = q.geometry;
            if (g.shape === 'rectangle') {
                if (g.width <= 0 || g.height <= 0) errors.push(`[Q${qNum} - ${qId}] Kích thước hình chữ nhật <= 0`);
                if (g.width <= g.height) errors.push(`[Q${qNum} - ${qId}] Hình chữ nhật có chiều dài (${g.width}) <= chiều rộng (${g.height})`);
            } else if (g.shape === 'square') {
                if (g.side <= 0) errors.push(`[Q${qNum} - ${qId}] Kích thước hình vuông <= 0`);
            } else if (g.shape === 'triangle') {
                if (g.base <= 0 || g.height <= 0) errors.push(`[Q${qNum} - ${qId}] Kích thước tam giác <= 0`);
            } else if (g.shape === 'trapezoid') {
                if (g.base1 <= 0 || g.base2 <= 0 || g.height <= 0) errors.push(`[Q${qNum} - ${qId}] Kích thước hình thang <= 0`);
            } else if (g.shape === 'circle') {
                if (g.radius <= 0) errors.push(`[Q${qNum} - ${qId}] Kích thước hình tròn <= 0`);
            }
        }
        
        // Fraction checks in expressions
        if (q.fractions) {
            q.fractions.forEach((f, idx) => {
                if (f.numerator !== undefined && f.denominator !== undefined) {
                    if (f.denominator <= 0) {
                        errors.push(`[Q${qNum} - ${qId}] Mẫu số <= 0 trong biểu thức phần tử ${idx}`);
                    }
                }
            });
        }
    });

    if (errors.length > 0) {
        console.error(`\n❌ Phát hiện ${errors.length} lỗi trong quá trình validate:\n`);
        errors.forEach(e => console.error(" - " + e));
        return false;
    } else {
        console.log(`\n✅ Validate thành công! Đã kiểm tra ${questions.length} câu hỏi, không phát hiện lỗi logic nào.`);
        return true;
    }
}

// Support running as standalone or required module
if (require.main === module) {
    const dataPath = path.join(__dirname, 'src', 'data', 'questions.json');
    if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const isValid = validateQuestions(data);
        if (!isValid) process.exit(1);
    } else {
        console.error("Không tìm thấy questions.json");
        process.exit(1);
    }
}

module.exports = validateQuestions;
