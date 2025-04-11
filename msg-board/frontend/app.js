const messageApi = {
    get: () => axios.get('/api/messages'),
    post: (message, timestamp) => axios.post('/api/messages', { message, timestamp }),
    delete: (id) => axios.delete(`/api/messages/${id}`),
    put: (id, message) => axios.put(`/api/messages/${id}`, { message })
};

const { createApp } = Vue;

createApp({
    data() {
        return {
            newMessage: '',
            messages: [],
            isLoading: false,
            editingMessage: null,
            editText: ''
        };
    },
    async created() {
        await this.loadMessages();
    },
    methods: {
        async loadMessages() {
            this.isLoading = true;
            try {
                const response = await messageApi.get();
                this.messages = response.data.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp).toLocaleString()
                }));
            } catch (error) {
                alert('Failed to load messages.');
            } finally {
                this.isLoading = false;
            }
        },
        async postMessage() {
            if (!this.newMessage.trim()) return;
            try {
                await messageApi.post(this.newMessage, new Date());
                await this.loadMessages();
                this.newMessage = '';
            } catch (error) {
                alert('Failed to post message.');
            }
        },
        async deleteMessage(id) {
            try {
                await messageApi.delete(id);
                await this.loadMessages();
            } catch (error) {
                alert('Failed to delete message.');
            }
        },
        startEdit(message) {
            this.editingMessage = message.id;
            this.editText = message.message;
        },
        cancelEdit() {
            this.editingMessage = null;
            this.editText = '';
        },
        async saveEdit() {
            if (!this.editText.trim()) return;
            try {
                await messageApi.put(this.editingMessage, this.editText);
                await this.loadMessages();
                this.cancelEdit();
            } catch (error) {
                alert('Failed to update message.');
            }
        }
    }
}).mount('#app');