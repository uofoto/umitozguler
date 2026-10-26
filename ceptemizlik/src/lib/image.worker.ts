/// <reference lib="webworker" />
import { handleRequest, type WorkerRequest } from './core';

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { response, transfer } = await handleRequest(event.data);
  scope.postMessage(response, transfer);
};
