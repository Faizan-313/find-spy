const generateRoomCode = (roomName: string, username: string): string => {
    return (
        roomName.toUpperCase() +
        username.slice(0, 2).toUpperCase() +
        Math.floor(1000 * Math.random() + 38).toString()
    );
};

export default generateRoomCode