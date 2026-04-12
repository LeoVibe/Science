#!/bin/bash
export PATH=/Users/s389080/.nvm/versions/node/v24.12.0/bin:$PATH
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
node scripts/orchestrator.js >> scripts/orchestrator-logs/run.log 2>&1
