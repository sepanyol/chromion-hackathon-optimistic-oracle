import { Bytes } from "@graphprotocol/graph-ts";
import {
  RequestAnswerUpdated,
  RequestStatusUpdated,
} from "../generated/templates/RequestContract/RequestContract";

export function handleRequestStatusUpdate(event: RequestStatusUpdated): void {}

export function handleRequestAnswerUpdate(event: RequestAnswerUpdated): void {}

export function handleEvaluateContext(content: Bytes): void {}
