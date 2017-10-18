/**************************************
 ****    DO NOT MODIFY THIS FILE    ****
 ***************************************/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <getopt.h>
#include "cachesim.h"

void print_help_and_exit(void) {
    printf("cachesim [OPTIONS] < traces/file.trace\n");
    printf("  -c1 C\t\tTotal size of the L1 cache in bytes is 2^C1\n");
    printf("  -c2 c\t\tTotal size of the L2 cache in bytes is 2^C2\n");
    printf("  -b B\t\tSize of each block in bytes is 2^B\n");
    printf("  -s S\t\tNumber of blocks per set is 2^S\n");
    printf("  -h\t\tThis helpful output\n");
    printf("Note the difference between 'C' and 'c' for size of L1 and L2 caches\n");
    exit(0);
}

void print_statistics(struct cache_stats_t* p_stats);

int main(int argc, char* argv[]) {
    int opt;
    uint64_t c1 = DEFAULT_C1;
    uint64_t c2 = DEFAULT_C2;
    uint64_t b = DEFAULT_B;
    uint64_t s = DEFAULT_S;
    FILE* fin  = stdin;

    /* Read arguments */ 
    while(-1 != (opt = getopt(argc, argv, "C:c:b:s:i:h"))) {
        switch(opt) {
            case 'C':
                c1 = atoi(optarg);
                break;
            case 'c':
                c2 = atoi(optarg);
                break;
            case 'b':
                b = atoi(optarg);
                break;
            case 's':
                s = atoi(optarg);
                break;
            case 'i':
                fin = fopen(optarg, "r");
                break;
            case 'h':
            default:
                print_help_and_exit();
                break;
        }
    }

    printf("Cache Settings\n");
    printf("C1: %" PRIu64 "\n", c1);
    printf("C2: %" PRIu64 "\n", c2);
    printf("B: %" PRIu64 "\n", b);
    printf("S: %" PRIu64 "\n", s);
    printf("\n");

    /* Setup the cache */
    cache_init(c1, c2, s, b);

    /* Setup statistics */
    struct cache_stats_t stats;
    memset(&stats, 0, sizeof(struct cache_stats_t));
    stats.l1_access_time = 2;
    stats.l2_access_time = 10;
    stats.memory_access_time = 100;

    /* Begin reading the file */ 
    char rw;
    uint64_t address;
    while (!feof(fin)) { 
        int ret = fscanf(fin, "%c %" PRIx64 "\n", &rw, &address); 
        if(ret == 2) {
            cache_access(rw, address, &stats); 
        }
    }

    cache_cleanup(&stats);
    print_statistics(&stats);
    fclose(fin);
    return 0;
}

void print_statistics(struct cache_stats_t* p_stats) {
    /* Overall stats */
    printf("Cache Statistics\n");
    printf("Accesses: %" PRIu64 "\n", p_stats->accesses);
    printf("Reads: %" PRIu64 "\n", p_stats->reads);
    printf("Read misses: %" PRIu64 "\n", p_stats->read_misses);
    printf("Writes: %" PRIu64 "\n", p_stats->writes);
    printf("Write misses: %" PRIu64 "\n", p_stats->write_misses);
    printf("Misses: %" PRIu64 "\n", p_stats->misses);
    printf("Writebacks: %" PRIu64 "\n", p_stats->write_backs);

    /* L1 misses */
    printf("L1 read misses: %" PRIu64 "\n", p_stats->l1_read_misses);
    printf("L1 write misses: %" PRIu64 "\n", p_stats->l1_write_misses);

    /* L2 misses */
    printf("L2 read misses: %" PRIu64 "\n", p_stats->l2_read_misses);
    printf("L2 write misses: %" PRIu64 "\n", p_stats->l2_write_misses);

    /* Access Times */
    printf("L1 access time: %" PRIu64 "\n", p_stats->l1_access_time);
    printf("L2 access time: %" PRIu64 "\n", p_stats->l2_access_time);
    printf("Memory access time: %" PRIu64 "\n", p_stats->memory_access_time);

    /* Miss Rates */
    printf("L1 Miss rate: %f\n", p_stats->l1_miss_rate);
    printf("L2 Miss rate: %f\n", p_stats->l2_miss_rate);
    printf("Miss rate: %f\n", p_stats->miss_rate);

    /* Average Access Times */
    printf("L2 average access time: %f\n", p_stats->l2_avg_access_time);
    printf("Average access time (AAT): %f\n", p_stats->avg_access_time);
}
