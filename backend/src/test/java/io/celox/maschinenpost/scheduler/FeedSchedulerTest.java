package io.celox.maschinenpost.scheduler;

import io.celox.maschinenpost.service.AiSummaryService;
import io.celox.maschinenpost.service.FeedService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedSchedulerTest {

    @Mock
    private FeedService feedService;

    @Mock
    private AiSummaryService aiSummaryService;

    @InjectMocks
    private FeedScheduler feedScheduler;

    @Test
    void runFetchCycle_callsServicesInOrder() {
        feedScheduler.runFetchCycle("Test");

        InOrder inOrder = inOrder(feedService, aiSummaryService);
        inOrder.verify(feedService).fetchAllFeeds();
        inOrder.verify(aiSummaryService).processUnprocessedArticles();
    }

    @Test
    void runFetchCycle_concurrentGuard_preventsParallel() throws Exception {
        // Manually set running flag to simulate concurrent execution
        Field runningField = FeedScheduler.class.getDeclaredField("running");
        runningField.setAccessible(true);
        AtomicBoolean running = (AtomicBoolean) runningField.get(feedScheduler);
        running.set(true);

        feedScheduler.runFetchCycle("Test");

        verifyNoInteractions(feedService);
        verifyNoInteractions(aiSummaryService);
    }

    @Test
    void runFetchCycle_releasesLock_afterSuccess() {
        feedScheduler.runFetchCycle("First");
        feedScheduler.runFetchCycle("Second");

        verify(feedService, times(2)).fetchAllFeeds();
        verify(aiSummaryService, times(2)).processUnprocessedArticles();
    }

    @Test
    void runFetchCycle_releasesLock_afterException() {
        doThrow(new RuntimeException("Feed error")).when(feedService).fetchAllFeeds();

        try {
            feedScheduler.runFetchCycle("Failing");
        } catch (RuntimeException ignored) {
        }

        // Lock should be released, second call should work
        reset(feedService);
        feedScheduler.runFetchCycle("Recovery");

        verify(feedService).fetchAllFeeds();
    }

    @Test
    void fetchFeeds_delegatesToRunFetchCycle() {
        feedScheduler.fetchFeeds();

        verify(feedService).fetchAllFeeds();
        verify(aiSummaryService).processUnprocessedArticles();
    }
}
