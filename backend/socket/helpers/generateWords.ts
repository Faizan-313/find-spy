import wordPairs from "../../data/words";

const generateWords = (): {word1: string, word2: string} => {
    const randomIndex = Math.floor(Math.random() * wordPairs.length);
    return wordPairs[randomIndex];
};

export default generateWords;