import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  Request,
  RequestScoring,
  RequestScoringHeatmap,
  RequestScoringRatings,
} from "../generated/schema";
import {
  AddedScoring,
  RequestScoringRegistry,
} from "./../generated/RequestScoringRegistry/RequestScoringRegistry";
import { getRequest } from "./helpers";

export function handleAddedScoring(event: AddedScoring): void {
  const id = event.params.request;

  if (Request.load(id) == null) return;

  const request = getRequest(id);
  const scoringContract = RequestScoringRegistry.bind(event.address);
  const scoringResponse = scoringContract.getScoring(id);

  const _scoring = new RequestScoring(id);
  const _scoringHeatmap = new RequestScoringHeatmap(id);
  const _scoringRatings = new RequestScoringRatings(id);

  _scoring.score = BigInt.fromI32(scoringResponse.score);
  _scoring.final_decision = BigInt.fromI32(scoringResponse.final_decision);

  _scoringHeatmap.ambiguity = BigInt.fromI32(scoringResponse.heatmap.ambiguity);
  _scoringHeatmap.clarity = BigInt.fromI32(scoringResponse.heatmap.clarity);
  _scoringHeatmap.completeness = BigInt.fromI32(
    scoringResponse.heatmap.completeness
  );
  _scoringHeatmap.source_trust = BigInt.fromI32(
    scoringResponse.heatmap.source_trust
  );
  _scoringHeatmap.logical_consistency = BigInt.fromI32(
    scoringResponse.heatmap.logical_consistency
  );
  _scoringHeatmap.time_reference = BigInt.fromI32(
    scoringResponse.heatmap.time_reference
  );

  _scoringRatings.ambiguity = transform(scoringResponse.ratings.ambiguity);
  _scoringRatings.clarity = transform(scoringResponse.ratings.clarity);
  _scoringRatings.completeness = transform(
    scoringResponse.ratings.completeness
  );
  _scoringRatings.source_trust = transform(
    scoringResponse.ratings.source_trust
  );
  _scoringRatings.logical_consistency = transform(
    scoringResponse.ratings.logical_consistency
  );
  _scoringRatings.time_reference = transform(
    scoringResponse.ratings.time_reference
  );

  request.scoring = _scoring.id;
  _scoring.heatmap = _scoringHeatmap.id;
  _scoring.ratings = _scoringRatings.id;

  _scoring.save();
  _scoringHeatmap.save();
  _scoringRatings.save();
  request.save();
}

function transform(no: number): BigDecimal {
  return BigDecimal.fromString(no.toString()).times(
    BigDecimal.fromString("0.25")
  );
}
