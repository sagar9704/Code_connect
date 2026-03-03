#include <stdio.h>
#ifdef _OPENMP
#include <omp.h>
#endif

int main() {

#ifdef _OPENMP
    omp_set_num_threads(4);

    double t1 = omp_get_wtime();

    #pragma omp parallel
    {
        int id = omp_get_thread_num();
        int total = omp_get_num_threads();
        printf("Hello from thread %d of %d\n", id, total);
    }

    double t2 = omp_get_wtime();
    printf("Time: %f seconds\n", t2 - t1);

#else
    printf("OpenMP NOT enabled.\n");
#endif

    return 0;
}
