export const getOrCreateUserId = () => {
    let userId = localStorage.getItem('userId');
    if(!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('chat_user_id', userId);
    }

    return userId;
}