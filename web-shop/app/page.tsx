export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Web Shop</h1>
      </div>

      <div className="relative flex place-items-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">AI-Powered E-commerce Platform</h2>
          <p className="text-lg text-gray-600">
            Intelligent web shop with AI agents for enhanced user experience
          </p>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h3 className="mb-3 text-2xl font-semibold">AI Agents</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Intelligent agents for customer service and recommendations
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h3 className="mb-3 text-2xl font-semibold">Smart Analytics</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Advanced analytics and insights for better business decisions
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h3 className="mb-3 text-2xl font-semibold">Personalization</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Personalized shopping experience for each customer
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
          <h3 className="mb-3 text-2xl font-semibold">Automation</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Automated workflows and intelligent task management
          </p>
        </div>
      </div>
    </main>
  );
}
