const scales = {
    'majeur': [0, 2, 4, 5, 7, 9, 11], 
    'mineur': [0, 2, 3, 5, 7, 8, 10], 
    'harmonisch_mineur': [0, 2, 3, 5, 7, 8, 11],
    'blues': [0, 3, 5, 6, 7, 10]
};

const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const enharmonicMap = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" };

const grondtoonSelect = document.getElementById('grondtoon');
const typeSelect = document.getElementById('toonladder_type');
const resultaatParagraaf = document.getElementById('resultaat_noten');
const pianoKeys = document.querySelectorAll('.piano .key');

function calculateScale() {
    const rootNote = grondtoonSelect.value;
    const scaleType = typeSelect.value;

    const intervals = scales[scaleType];
    if (!intervals) return;

    const rootIndex = chromaticScale.indexOf(rootNote.split(' ')[0]);

    const scaleNotesDisplay = []; // Voor de tekstweergave (met enharmonische namen)
    const scaleNotesData = [];    // Voor de data-attribuut matching (alleen C, C#, D, etc.)

    intervals.forEach(interval => {
        const noteIndex = (rootIndex + interval) % 12;
        let note = chromaticScale[noteIndex];
        
        let displayNote = note;
        if (enharmonicMap[note]) {
             displayNote = `${note} / ${enharmonicMap[note]}`;
        }
        scaleNotesDisplay.push(displayNote.split(' ')[0]);

        scaleNotesData.push(note);
    });

    resultaatParagraaf.textContent = `Noten in de toonladder: ${scaleNotesDisplay.join(', ')}`;
    
    updatePiano(scaleNotesData); 
}

function updatePiano(notesToHighlight) {
    pianoKeys.forEach(key => {
        key.classList.remove('highlighted');
    });

    notesToHighlight.forEach(note => {
        const keys = document.querySelectorAll(`.piano .key[data-note="${note}"]`);
        keys.forEach(key => {
            key.classList.add('highlighted');
        });
    });
}

grondtoonSelect.addEventListener('change', calculateScale);
typeSelect.addEventListener('change', calculateScale);

calculateScale();
