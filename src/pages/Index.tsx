import Chatbot from '@/components/Chatbot';

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Chatbot Interface</h1>
          <p className="text-xl text-muted-foreground">Chat with our AI assistant powered by your webhook</p>
        </div>
        <Chatbot />
      </div>
    </div>
  );
};

export default Index;
