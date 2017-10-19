/**********************************************
****** 		DO NOT MODIFY THIS FILE		*******
***********************************************/

#ifndef CACHESIM_H
#define CACHESIM_H

#include <inttypes.h>
#include <stdlib.h>

struct cache_stats_t {
    uint64_t accesses;
    uint64_t reads;
    uint64_t read_misses;
    uint64_t writes;
    uint64_t write_misses;
    uint64_t misses;
	uint64_t write_backs;
   
    uint64_t l1_read_misses;
    uint64_t l1_write_misses;

    uint64_t l2_read_misses;
    uint64_t l2_write_misses;

    uint64_t l1_access_time;
    uint64_t l2_access_time;
    uint64_t memory_access_time;

    double l1_miss_rate;
    double l2_miss_rate;
    double miss_rate;

    double l2_avg_access_time;
    double avg_access_time;
};

void cache_init(uint64_t C1, uint64_t C2,  uint64_t S, uint64_t B);
void cache_access (char rw, uint64_t address, struct cache_stats_t *stats);
void cache_cleanup (struct cache_stats_t *stats);

static const uint64_t DEFAULT_C1 = 10;   /* 1KB L1 Cache */
static const uint64_t DEFAULT_C2 = 15;  /* 32KB L2 Cache */
static const uint64_t DEFAULT_B = 5;    /* 32-byte blocks */
static const uint64_t DEFAULT_S = 3;    /* 8 blocks per set */

static const char READ = 'r';
static const char WRITE = 'w';

#endif

