//src/server/index.ts


import { TrainingServerWSS } from "./TrainingsserverWSS";

async () => {

try {

		const server = await TrainingServerWSS.getInstance()

		console.log(`Server running on http://localhost:${server.getPort()}`);
		console.log(`ws endpoint ws://localhost:${server.getPort()}/ws`);

    const httpServer = (server as any).server as import('node:http').Server;
		httpServer.on("")



} catch (error) {

}

};
