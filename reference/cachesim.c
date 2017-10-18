#include "cachesim.h"
#include <stdio.h>

#define TRUE 1
#define FALSE 0
#define OSBIT 64
#define EXPONENTBASE 1



/*////////////////////////////////////////////////////////////////

Message to the TA's

I wasn't able to figure out why my Write_Backs stat is incorrect. Also, there a a few cases in the Fully Associative Cache that are slightly wrong. 
Other than that, I hope you will find that this code works!

/*////////////////////////////////////////////////////////////////


/**
 * The stuct that you may use to store the metadata for each block in the L1 and L2 caches
 */
typedef struct block_t {
    uint64_t tag; // The tag stored in that block
    uint8_t valid; // Valid bit
    uint8_t dirty; // Dirty bit

    /**************** TODO ******************/

    uint64_t index;
    uint64_t lastAccess;

    /*
        Add another variable here to perform the LRU replacement. Look into using a counter
        variable that will keep track of the oldest block in a set
    */


} block;


/**
 * A struct for storing the configuration of both the L1 and L2 caches as passed in the
 * cache_init function. All values represent number of bits. You may add any parameters
 * here, however I strongly suggest not removing anything from the config struct
 */
typedef struct config_t {
    uint64_t C1; /* Size of cache L1 */
    uint64_t C2; /* Size of cache L2 */
    uint64_t S; /* Set associativity of L2 */
    uint64_t B; /* Block size of both caches */
    uint64_t offsetSize;
    uint64_t indexSize;
    uint64_t tagSize;
    uint64_t numBlocks;
    uint64_t numSets;
    uint64_t blockCapacity;
} config;


/****** Do not modify the below function headers ******/
static uint64_t get_tag(uint64_t address, uint64_t C, uint64_t B, uint64_t S);
static uint64_t get_index(uint64_t address, uint64_t C, uint64_t B, uint64_t S);
static uint64_t convert_tag(uint64_t tag, uint64_t index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S);
static uint64_t convert_index(uint64_t tag, uint64_t index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S);
static uint64_t convert_tag_l1(uint64_t l2_tag, uint64_t l2_index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S);
static uint64_t convert_index_l1(uint64_t l2_tag, uint64_t l2_index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S);
static uint64_t get_offset(uint64_t address, uint64_t B);

/****** You may add Globals and other function headers that you may need below this line ******/

static uint64_t GLOBAL_TIMER = 1;
static block** pl1;
static block** pl2;

static config l1config;
static config l2config;


//REMIND ME TO DELETE THIS COMMENT LATER
//printf("setOffset: %" PRIu64 "\n", setOffset);


/**
 * Subroutine for initializing your cache with the passed in arguments.
 * You may initialize any globals you might need in this subroutine
 *
 * @param C1 The total size of your L1 cache is 2^C1 bytes
 * @param C2 The total size of your L2 cache is 2^C2 bytes
 * @param S The total number of blocks in a line/set of your L2 cache are 2^S
 * @param B The size of your blocks is 2^B bytes
 */
void cache_init(uint64_t C1, uint64_t C2, uint64_t S, uint64_t B)
{
    /* 
        Initialize the caches here. I strongly suggest using arrays for representing
        meta data stored in the caches. The block_t struct given above maybe useful
    */

    /**************** TODO ******************/
    //printf("cache_init begin\n");
    uint64_t numBlocks;

    numBlocks = EXPONENTBASE<<(C1-B);
    pl1 = (block**)malloc(sizeof(block)*numBlocks);
    for(int i = 0; i < numBlocks; i++){
        pl1[i] = (block*)malloc(sizeof(block));
    }
    if(pl1[0]){
        l1config.numBlocks = numBlocks;
    }
    l1config.C1 = C1;
    l1config.B = B;
    l1config.offsetSize = B;
    l1config.indexSize = C1 - B;
    l1config.tagSize = OSBIT - C1;
    l1config.blockCapacity = EXPONENTBASE<<B;

    numBlocks = EXPONENTBASE<<(C2-B);
    pl2 = (block**)malloc(sizeof(block)*numBlocks);
    for(int i = 0; i < numBlocks; i++){
        pl2[i] = (block*)malloc(sizeof(block));
    }
    if(pl2[0]){
        l2config.numBlocks = numBlocks;
    }
    l2config.C2 = C2;
    l2config.S = S;
    l2config.B = B;
    l2config.offsetSize = B;
    l2config.indexSize = C2 - S - B;
    l2config.tagSize = OSBIT - C2 + S;
    l2config.blockCapacity = EXPONENTBASE<<B;

    //printf("cache_init end\n");

}

/**
 * Subroutine that simulates one cache event at a time.
 * @param rw The type of access, READ or WRITE
 * @param address The address that is being accessed
 * @param stats The struct that you are supposed to store the stats in
 */
void cache_access (char rw, uint64_t address, struct cache_stats_t *stats)
{
    /* 
        Suggested approach:
            -> Find the L1 tag and index of the address that is being passed in to the function
            -> Check if there is a hit in the L1 cache
            -> If L1 misses, check the L2 cache for a hit (Hint: If L2 hits, update L1 with new values)
            -> If L2 misses, need to get values from memory, and update L2 and L1 caches
            
            * We will leave it upto you to decide what must be updated and when
     */

    /**************** TODO ******************/
    //printf("cache_access begin\n");
    stats->accesses++;

    uint64_t l1tag = get_tag(address,l1config.C1,l1config.B,0);
    uint64_t l1index = get_index(address,l1config.C1,l1config.B,0);
    
    //stats
    if(rw == READ){
        stats->reads++;
    }else{
        stats->writes++;
    }

    pl1[l1index]->lastAccess = GLOBAL_TIMER;
    if(pl1[l1index]->tag == l1tag && pl1[l1index]->valid){
        //todo: successful l1 read
        if(rw == WRITE){
            pl1[l1index]->dirty = 1;
        }

        //update l2 LRU
        uint64_t l2tag = get_tag(address, l2config.C2, l2config.B, l2config.S);
        uint64_t l2index = get_index(address, l2config.C2, l2config.B, l2config.S);
        uint64_t setCapacity = (EXPONENTBASE<<(l2config.C2 - l2config.B - l2config.indexSize));
        uint64_t setOffset = l2index * setCapacity;
        for(int i = 0; i < setCapacity; i++){
            if(pl2[setOffset + i]->tag == l2tag && pl2[setOffset + i]->valid){
                pl2[setOffset + i]->lastAccess = GLOBAL_TIMER;
                break;
            }
        }

    }else{
        //stats
        if(rw == READ){
            stats->read_misses++;
            stats->l1_read_misses++;
            stats->misses++;
        }else{
            stats->write_misses++;
            stats->l1_write_misses++;
            stats->misses++;
        }

        uint64_t l2tag = get_tag(address, l2config.C2, l2config.B, l2config.S);
        uint64_t l2index = get_index(address, l2config.C2, l2config.B, l2config.S);
        uint8_t l2success = FALSE;
        uint64_t l2targetBlock = -1;
        uint64_t l2targetBlockEvict = -1;
        uint64_t setCapacity = (EXPONENTBASE<<(l2config.C2 - l2config.B - l2config.indexSize));
        uint64_t setOffset = l2index * setCapacity;
        uint64_t LRU = GLOBAL_TIMER;
        
        for(int i = 0; i < setCapacity; i++){
            if(pl2[setOffset + i]->tag == l2tag && pl2[setOffset + i]->valid){
                l2success = TRUE;
                pl2[setOffset + i]->lastAccess = GLOBAL_TIMER;
                if(pl1[l1index]->dirty && pl1[l1index]->valid){
                    //L1 writeback
                    uint64_t evictl2tag = convert_tag(l1tag, l1index, l1config.C1, l2config.C2, l1config.B, l1config.S);
                    uint64_t evictl2index;
                    for(int j = 0; j < setCapacity; j++){
                        if(pl2[setOffset + j]->tag == evictl2tag){
                            evictl2index = j;
                            break;
                        }
                    }
                    pl2[evictl2index]->dirty = 1;
                }
                pl1[l1index]->valid = 1;
                pl1[l1index]->dirty = 0;
                pl1[l1index]->tag = l1tag;

                 //todo: successful l2 read
                if(rw == WRITE){
                    pl1[l1index]->dirty = 1;
                }
                break;
            }else if(pl2[setOffset + i]->valid == 0 && l2targetBlock == -1){
                l2targetBlock = setOffset + i;
            }else if(pl2[setOffset + i]->lastAccess < LRU){
                l2targetBlockEvict = setOffset + i;
                LRU = pl2[setOffset + i]->lastAccess;
            }
        }
        if(!l2success){
            //stats
            if(rw == READ){
                stats->read_misses++;
                stats->l2_read_misses++;
                stats->misses++;
            }else{
                stats->write_misses++;
                stats->l2_write_misses++;
                stats->misses++;
            }

            if(l2targetBlock == -1){
                //todo: evict targetBlock
                l2targetBlock = l2targetBlockEvict;
                uint64_t l1targetTag = convert_tag_l1(l2tag, l2index, l1config.C1, l2config.C2, l2config.B, l2config.S);
                uint64_t l1targetIndex = convert_index_l1(l2tag, l2index, l1config.C1, l2config.C2, l2config.B, l2config.S);
                if(pl1[l1targetIndex]->dirty && pl1[l1targetIndex]->valid){
                    //L1 writeback
                    pl2[l2targetBlock]->dirty = 1;
                    pl1[l1targetIndex]->valid = 0;
                }
                if(pl2[l2targetBlock]->dirty && pl2[l2targetBlock]->valid){
                    //L2 writeback
                    stats->write_backs++;
                    pl2[l2targetBlock]->valid = 0;
                }
                
            }
            pl2[l2targetBlock]->lastAccess = GLOBAL_TIMER;
            pl2[l2targetBlock]->valid = 1;
            pl2[l2targetBlock]->tag = l2tag;
            pl2[l2targetBlock]->index = l2index;
            pl1[l1index]->valid = 1;
            pl1[l1index]->lastAccess = GLOBAL_TIMER;
            pl1[l1index]->tag = l1tag;
            pl1[l1index]->index = l1index;
            if(rw == WRITE){
                pl1[l1index]->dirty = 1;
            }
            
        }
    }

    GLOBAL_TIMER++;
    //printf("cache_access end\n");
}

/**
 * Subroutine for freeing up memory, and performing any final calculations before the statistics
 * are outputed by the driver
 */
void cache_cleanup (struct cache_stats_t *stats)
{
    /*
        Make sure to free up all the memory you malloc'ed here. To check if you have freed up the
        the memory, run valgrind. For more information, google how to use valgrind.
    */

    /**************** TODO ******************/
    //printf("cache_cleanup begin\n");

    //stats
    stats->l1_miss_rate = ((double)(stats->l1_read_misses) + (double)(stats->l1_write_misses))/((double)(stats->accesses));
    stats->l2_miss_rate = ((double)(stats->l2_read_misses) + (double)(stats->l2_write_misses))/((double)(stats->l1_read_misses) + (double)(stats->l1_write_misses));
    stats->miss_rate = ((double)(stats->misses))/((double)(stats->accesses));
    stats->l2_avg_access_time = stats->l2_access_time + (stats->l2_miss_rate * stats->memory_access_time);
    stats->avg_access_time = stats->l1_access_time + (stats->l1_miss_rate * stats->l2_avg_access_time);


    uint64_t numBlocks = EXPONENTBASE<<(l1config.C1 - l1config.B);
    for(int i = 0; i < numBlocks; i++){
        free((void*)pl1[i]);
    }
    numBlocks = EXPONENTBASE<<(l2config.C2 - l2config.B);
    for(int i = 0; i < numBlocks; i++){
        free((void*)pl2[i]);
    }
    free((void*)pl1);
    free((void*)pl2);

    //todo: finish freeing up all mallocs

    //printf("cache_cleanup end\n");
}

/**
 * Subroutine to compute the Tag of a given address based on the parameters passed in
 *
 * @param address The address whose tag is to be computed
 * @param C The size of the cache in bits (i.e. Size of cache is 2^C)
 * @param B The size of the cache block in bits (i.e. Size of block is 2^B)
 * @param S The set associativity of the cache in bits (i.e. Set-Associativity is 2^S)
 * 
 * @return The computed tag
 */
static uint64_t get_tag(uint64_t address, uint64_t C, uint64_t B, uint64_t S)
{
    /**************** TODO ******************/
    uint64_t mask = (EXPONENTBASE<<(OSBIT - C + S)) - 1;
    return (address >> (C-S)) & mask;
}

/**
 * Subroutine to compute the Index of a given address based on the parameters passed in
 *
 * @param address The address whose tag is to be computed
 * @param C The size of the cache in bits (i.e. Size of cache is 2^C)
 * @param B The size of the cache block in bits (i.e. Size of block is 2^B)
 * @param S The set associativity of the cache in bits (i.e. Set-Associativity is 2^S)
 *
 * @return The computed index
 */
static uint64_t get_index(uint64_t address, uint64_t C, uint64_t B, uint64_t S)
{
    /**************** TODO ******************/
    uint64_t mask = (EXPONENTBASE<<(C - S - B)) - 1;
    return (address >> B) & mask;
}


/**** DO NOT MODIFY CODE BELOW THIS LINE UNLESS YOU ARE ABSOLUTELY SURE OF WHAT YOU ARE DOING ****/

/*
    Note:   The below functions will be useful in converting the L1 tag and index into corresponding L2
            tag and index. These should be used when you are evicitng a block from the L1 cache, and
            you need to update the block in L2 cache that corresponds to the evicted block.

            The newly added functions will be useful for converting L2 indecies ang tags into the corresponding
            L1 index and tags. Make sure to understand how they are working.
*/

/**
 * This function converts the tag stored in an L1 block and the index of that L1 block into corresponding
 * tag of the L2 block
 *
 * @param tag The tag that needs to be converted (i.e. L1 tag)
 * @param index The index of the L1 cache (i.e. The index from which the tag was found)
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 */
static uint64_t convert_tag(uint64_t tag, uint64_t index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S)
{
    uint64_t reconstructed_address = (tag << (C1 - B)) | index;
    return reconstructed_address >> (C2 - B - S);
}

/**
 * This function converts the tag stored in an L1 block and the index of that L1 block into corresponding
 * index of the L2 block
 *
 * @param tag The tag stored in the L1 index
 * @param index The index of the L1 cache (i.e. The index from which the tag was found)
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 */
static uint64_t convert_index(uint64_t tag, uint64_t index, uint64_t C1, uint64_t C2, uint64_t B,  uint64_t S)
{
    // Reconstructed address without the block offset bits
    uint64_t reconstructed_address = (tag << (C1 - B)) | index;
    // Create index mask for L2 without including the block offset bits
    return reconstructed_address & ((1 << (C2 - S - B)) - 1);
}

/**
 * This function converts the tag stored in an L2 block and the index of that L2 block into corresponding
 * tag of the L1 cache
 *
 * @param l2_tag The L2 tag
 * @param l2_index The index of the L2 block
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 * @return The L1 tag linked to the L2 index and tag
 */
static uint64_t convert_tag_l1(uint64_t l2_tag, uint64_t l2_index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S) {
    uint64_t reconstructed_address = (l2_tag << (C2 - B - S)) | l2_index;
    return reconstructed_address >> (C1 - B);
}

/**
 * This function converts the tag stored in an L2 block and the index of that L2 block into corresponding
 * index of the L1 block
 *
 * @param l2_tag The L2 tag
 * @param l2_index The index of the L2 block
 * @param C1 The size of the L1 cache in bits
 * @param C2 The size of the l2 cache in bits
 * @param B The size of the block in bits
 * @param S The set associativity of the L2 cache
 * @return The L1 index of the L2 block
 */
static uint64_t convert_index_l1(uint64_t l2_tag, uint64_t l2_index, uint64_t C1, uint64_t C2, uint64_t B, uint64_t S) {
    uint64_t reconstructed_address = (l2_tag << (C2 - B - S)) | l2_index;
    return reconstructed_address & ((1 << (C1 - B)) - 1);
}
