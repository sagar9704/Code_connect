#include <stdio.h>
#include <stdlib.h>
#ifdef _OPENMP
#include <omp.h>
#endif

int main(int argc, char** argv) {
    int n = 100000000; // work size
    if (argc > 1) n = atoi(argv[1]);
    int num_threads = 4;
    #ifdef _OPENMP
    #pragma omp parallel
    {
        #pragma omp single
        num_threads = omp_get_max_threads();
    }
    #endif

    double t0 = 0.0;
    #ifdef _OPENMP
    t0 = omp_get_wtime();
    #else
    t0 = (double)clock() / CLOCKS_PER_SEC;
    #endif

    long long sum = 0;
    #ifdef _OPENMP
    #pragma omp parallel for reduction(+:sum)
    #endif
    for (int i = 0; i < n; ++i) {
        sum += i % 7; // small work per iteration
    }

    double t1 = 0.0;
    #ifdef _OPENMP
    t1 = omp_get_wtime();
    #else
    t1 = (double)clock() / CLOCKS_PER_SEC;
    #endif

    printf("threads=%d n=%d sum=%lld time=%f s\n", num_threads, n, sum, t1 - t0);
    return 0;
}
