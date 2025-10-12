using System.Threading;

namespace API.HelperEntities
{
    public class SeedingState
    {
        private bool _seedingComplete = false;
        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);
        
        public async Task WaitForSeedingAsync(CancellationToken cancellationToken = default)
        {
            while (!_seedingComplete && !cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(1000, cancellationToken);
            }
        }
        
        public void SetSeedingComplete()
        {
            _seedingComplete = true;
        }
    }
}