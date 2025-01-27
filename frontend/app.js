const { createApp } = Vue;

createApp({
    data() {
        return {
            newMessage: '',
            messages: []
        };
    },
    async created() {
        await this.loadMessages();
    },
    methods: {
        async loadMessages() {
            try {
                const response = await axios.get('/api/messages');
                this.messages = response.data;
            } catch (error) {
                alert('Failed to load messages.');
            }
        },
        async postMessage() {
            try {
                await axios.post('/api/messages', { message: this.newMessage });
                await this.loadMessages();
                this.newMessage = '';
            } catch (error) {
                alert('Failed to post message.');
            }
        }
    }
}).mount('#app');