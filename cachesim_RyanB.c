/*
 * Name: cachesim.c
 * Purpose: Simulates chache memory
 * Date: 02/13/2017
 * 
 * Main file in Project 1: Cache Simulator 
 * in CS 4290 at Georgia Tech
 *
 *
 *Created by Ryan Berst
 */


#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <unistd.h>
#include <stdint.h>


#include "cachesim.h"
#include "parse_trace.c"
#include "test.c"

unsigned char C, B, S, V, K;
char *fileName;

_Bool **valid_array;
_Bool **dirty_array;
unsigned char **LRU_array;
struct parsed_addr **cacheTable;
struct parsed_addr **victimCache;
_Bool **VC_valid_array;
cache_stats_t stats;

int checkInput(unsigned char C, unsigned char B, unsigned char S, 
	unsigned char V, unsigned char K);
//_Bool cacheLookup(unsigned long long lookupAddr);
void cache_setup();
void run_sim();
void print_statistics(cache_stats_t* p_stats);

int main (int argc, char *argv[]) {

	
	int opt;
	C = (unsigned char) DEFAULT_C;
	B = (unsigned char) DEFAULT_B;
	S = (unsigned char) DEFAULT_S;
	V = (unsigned char) DEFAULT_V;
	K = (unsigned char) DEFAULT_K;

	while ((opt = getopt(argc, argv, "C:B:S:V:K:i:")) != -1) {
		switch (opt) {
			case 'C':
				C = (unsigned char) atoi(optarg);
				break;
			case 'B':
				B = (unsigned char) atoi(optarg);
				break;
			case 'S':
				S = (unsigned char) atoi(optarg);
				break;
			case 'V':
				V = (unsigned char) atoi(optarg);
				break;
			case 'K':
				K = (unsigned char) atoi(optarg);
				break;
			case 'i':
				fileName = optarg;
				break;
		}

	}


   	printf("C: %d  B: %d  S: %d\n", C, B, S);

   	//ensure values are in bounds
   	if (checkInput(C, B, S, V, K)) {
   		printf("ERROR: Invalid input. Exiting.\n");
   		return -1;
   	}

   	cache_setup();

   	printf("Running Simulation...\n");

   	run_sim(fileName);

   	print_statistics(&stats);

	//test_parse(argc, argv);

	return 0;
}


int checkInput(unsigned char C, unsigned char B, unsigned char S, 
	unsigned char V, unsigned char K) {

	if (B < 3 || B > 7) {
		printf("ERROR: B must be between 3 and 7, inclusive. Actual: %d\n", B);
		return -1;
	}
	if (C < B || C > 30) {
		printf("ERROR: C must be between %d(B) and 30, inclusive. Actual: %d\n", B, C);
		return -1;
	}
	if (S < 0 || S > (C - B)) {
		printf("ERROR: S must be between 0 and %d(C-B), inclusive. Actual: %d\n", S-B, S);
		return -1;
	}
	if (V < 0 || V > 8) {
		printf("ERROR: V must be between 0 and 8, inclusive. Actual: %d\n", V);
		return -1;
	}
	if (K < 1 || K > (B - 1)) {
		printf("ERROR: K must be between 1 and %d(B-1), inclusive. Actual: %d\n", B-1, K);
		return -1;
	}

	return 0;

}

/*

_Bool cacheLookup(unsigned long long lookupAddr) {
	struct parsed_addr parsed_lookupAddr;
	parsed_lookupAddr.tag = getTag(lookupAddr, C, S);
	parsed_lookupAddr.index = getIndex(lookupAddr, C, B, S);
	parsed_lookupAddr.offset = getOffset(lookupAddr, B);

} */

void cache_setup() {

	int indexSize = ADDR_SIZE - (C - B - S) - B;

	//valid_array = malloc((1 << indexSize) * (1 << S) * sizeof(_Bool));
	valid_array = malloc((1 << indexSize) * sizeof(*valid_array));
	if (valid_array) {
		for (int i = 0; i < (1 << indexSize); i++){
			valid_array[i] = malloc((1 << S) * sizeof(_Bool) * (1 << K));
		}
	}

	dirty_array = malloc((1 << indexSize) * sizeof(*dirty_array));
	if (dirty_array) {
		for (int i = 0; i < (1 << indexSize); i++){
			dirty_array[i] = malloc((1 << S) * sizeof(_Bool) * (1 << K));
		}
	}

	LRU_array = malloc((1 << indexSize) * sizeof(*LRU_array));
	if (LRU_array) {
		for (int i = 0; i < (1 << indexSize); i++){
			LRU_array[i] = malloc((1 << S) * sizeof(unsigned char));
		}
	}

	//cacheTable = malloc((1 << indexSize) * (1 << S) * sizeof(struct parsed_addr ));
	cacheTable = malloc((1 << indexSize) * sizeof(*cacheTable));
	if (cacheTable) {
		for (int i = 0; i < (1 << indexSize); i++){
			cacheTable[i] = malloc((1 << S) * sizeof(struct parsed_addr ));
		}
	}

	victimCache = malloc((1 << V) * sizeof(*victimCache));
	if (victimCache) {
		for (int i = 0; i < (1 << V); i++){
			victimCache[i] = malloc(sizeof(struct parsed_addr ));
		}
	}

	VC_valid_array = malloc((1 << V) * sizeof(*VC_valid_array));
	if (VC_valid_array) {
		for (int i = 0; i < (1 << V); i++){
			VC_valid_array[i] = malloc(sizeof(_Bool));
		}
	}

}

void run_sim(char *fileName) {

	FILE* traceFile;
	struct parsed_addr mem_access;
	int set_size = 1 << S;
	int num_subBlocks = 1 << K;

	int subBlock_bitMask = (1 << B) - 1 - (((B - K) << 1) - 1);
	printf("Sub block bit mask:  %d\n", subBlock_bitMask);

	//int VC_head = 0; //insert at head
	//int VC_tail = 0; //choose victim at tail
	
	_Bool blockHit = false;
	_Bool subBlockHit = false;
	_Bool LRU_promotion = false;

	int lineNum = 0;


	if((traceFile = fopen(fileName, "r")) == NULL) {
		printf("ERROR: Unable to open file\n");
		return;
	}

	//for (int i = 0; i < 10000; i++) {
	while (parse_trace(traceFile, &mem_access, C, B, S) == 0) {

		blockHit = false;
		subBlockHit = false;
		LRU_promotion = false;

		lineNum++;

		/*
		if(parse_trace(traceFile, &mem_access, C, B, S) != 0) {
			return;
		}
		*/
		

		stats.accesses++;

		//printf("TEST_%d\ttag:%llx\n", i, cacheTable[mem_access.index][0].tag);

		for (int j = 0; j < set_size; j++) {
			if (cacheTable[mem_access.index][j].tag == mem_access.tag) {
				for (int k = 0; k < num_subBlocks; k++) { //walk the sub-blocks
					if (valid_array[mem_access.index][j + k]) { //check each valid bit
						blockHit = true;						//at least one sub-block
						break;									//is valid, so block hit
					}
				}
				if (blockHit) { //hit
					int subBlock = (mem_access.offset & subBlock_bitMask) >> (B - K);
					subBlockHit = valid_array[mem_access.index][j + subBlock]; //sub hit if valid
					if (!subBlockHit) {	//If block hit, but sub-block miss
						stats.subblock_misses++;
						for (int k = subBlock; k < num_subBlocks; k++) { //walk the sub-blocks
							if (valid_array[mem_access.index][j + k]) { //check each valid bit
								break;									//stop if find valid
							}
							valid_array[mem_access.index][j + k] = true; //read-in sub-block (aka set valid)
							stats.bytes_transferred += (1 << (B - K));
						}
					}

					if (mem_access.isWrite) {
						dirty_array[mem_access.index][j + subBlock] = true; //set dirty if write
					}

					if (!(LRU_array[mem_access.index][j] >= set_size - 1)) { //if LRU is not already max
						LRU_promotion = true;
						LRU_array[mem_access.index][j] += 2;	//increment LRU value		
					} else {
						LRU_promotion = false;
					}
				}
			}
		}

		if (!blockHit) {		//on a miss
			//--------------
			/*
			if (lineNum > 9800) {
				if (mem_access.isWrite) {
					printf("Write ");
				} else {
					printf("Read  ");
				}
				printf("Miss on\tTag: %llx\tIndex: %lx   Offset: %lx\tline: %d\n", 
					mem_access.tag, mem_access.index, mem_access.offset, lineNum);
			}
			*/
			//---------------
			stats.misses++; //count misses
			for (int j = 0; j < set_size; j++) { //walk the set
				if (LRU_array[mem_access.index][j] == 0) { //choose victim
					//printf("TEST\t");
					//start victim cache logic ------
					
					//end victim cache logic ------
					for (int k = 0; k < num_subBlocks; k++) { //iterate through all sub-blocks
						if (dirty_array[mem_access.index][j + k]) { //is evicted sub-block dirty?
							stats.write_backs++; //write back
							stats.bytes_transferred += (1 << (B - K));
						}
						//may need to change scripting
						valid_array[mem_access.index][j + k] = false; //invalidate sub-blocks

					}
					int subBlock = (mem_access.offset & subBlock_bitMask) >> (B - K); //get the bits that detail the subBlock
					for (int k = subBlock; k < num_subBlocks; k++) { 	//fetch this sublock
						valid_array[mem_access.index][j + k] = true;	//until end of block
						dirty_array[mem_access.index][j + k] = false;
						stats.bytes_transferred += (1 << (B - K));
					}
					//-----------
					/*
					printf("offset: %lx\n", mem_access.offset);
					printf("sub-block: %d\n", subBlock);
					printf("Valid at index %lx: ", mem_access.index);
					for (int k = 0; k < num_subBlocks; k++) {
						printf("%d ", valid_array[mem_access.index][j + k]);
					}
					printf("\n");
					*/
					//-----------
					cacheTable[mem_access.index][j] = mem_access;
					LRU_array[mem_access.index][j] += 2;	//add two to compensate for decrement of all
					break; //stop searching for victims
				}
			}
		} else {
			//---------------
			/*
			if (lineNum > 9800) {
				if (mem_access.isWrite) {
					printf("Write ");
				} else {
					printf("Read  ");
				}			
				printf("Hit on \tTag: %llx\tIndex: %lx   Offset: %lx\tline: %d\n", 
					mem_access.tag, mem_access.index, mem_access.offset, lineNum);
			}
			*/
			//---------------
		}



		for (int j = 0; j < set_size; j++) { //walk the set
			if (!LRU_promotion) {	//don't do anything if no block was promoted in LRU
				break;
			}
			if (LRU_array[mem_access.index][j] != 0) {
				LRU_array[mem_access.index][j]--;	//decrement LRU value
			}
		}

		

		if (mem_access.isWrite) {	//write
			stats.writes++;
			if (blockHit) {				//write hit
				
			} else {				//write miss
				stats.write_misses++;
			}
		} else {					//read
			stats.reads++;
			if (blockHit) {				//read hit
				
			} else {				//read miss
				stats.read_misses++;
			}
		}

	}
	stats.hit_time = 2 + 0.1 * (2 ^ S);
	stats.miss_penalty = 100;
	stats.miss_rate = (float) (stats.misses + stats.vc_misses) / stats.accesses;
	stats.avg_access_time = stats.hit_time + stats.miss_rate * stats.miss_penalty;

	fclose(traceFile);
}

void print_statistics(cache_stats_t* p_stats) {
    printf("Cache Statistics\n");
    printf("Accesses: %lu\n", p_stats->accesses);
    printf("Reads: %lu\n", p_stats->reads);
    printf("Read misses: %lu\n", p_stats->read_misses);
    printf("Read misses combined: %lu\n", p_stats->read_misses_combined);
    printf("Writes: %lu\n", p_stats->writes);
    printf("Write misses: %lu\n", p_stats->write_misses);
    printf("Write misses combined: %lu\n", p_stats->write_misses_combined);
    printf("Misses: %lu\n", p_stats->misses);
    printf("Writebacks: %lu\n", p_stats->write_backs);
    printf("Victim cache misses: %lu\n", p_stats->vc_misses);
    printf("Sub-block misses: %lu\n", p_stats->subblock_misses);
    printf("Bytes transferred to/from memory: %lu\n", p_stats->bytes_transferred);
    printf("Hit Time: %f\n", p_stats->hit_time);
    printf("Miss Penalty: %f\n", p_stats->miss_penalty);
    printf("Miss rate: %f\n", p_stats->miss_rate);
    printf("Average access time (AAT): %f\n", p_stats->avg_access_time);
}