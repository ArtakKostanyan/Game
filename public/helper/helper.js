function calculateCardPoints(card) {
    const value = extractCardValue(card);

    switch (value) {
        case 'A':
            return 11;
        case '10':
            return 10;
        case 'K':
            return 4;
        case 'Q':
            return 3;
        case 'J':
            return 2;
        default:
            return 0;
    }
}

function extractCardValue(card) {
    return card.split('_')[1];
}