import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { navigateToAddItem } from "@/lib/navigationHelpers";

const LearningSection = () => {
  const { learningItems, updateLearningItem, isLoading } = useAppContext();

  const currentlyLearning = learningItems.filter(item => item.isCurrentlyLearning);

  const handleStartLearning = async (id: number) => {
    await updateLearningItem(id, { isCurrentlyLearning: true });
  };

  const handleContinueLearning = async (id: number) => {
    console.log("Continue learning item:", id);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-inter font-semibold text-primary">Learning</h2>
          <button className="text-secondary hover:text-primary transition-colors">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>

        <div>
          {currentlyLearning.length === 0 ? (
            <div className="text-center py-6">
              <i className="ri-book-open-line text-4xl text-secondary mb-3"></i>
              <h3 className="text-xl font-medium mb-2">Not learning anything yet</h3>
              <p className="text-secondary mb-4">Start learning something new</p>
              <Button 
                onClick={() => navigateToAddItem('/learning')}
              >
                <i className="ri-add-line mr-1"></i> Start Learning Something
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentlyLearning.map(item => (
                <div key={item.id} className="p-3 bg-primary bg-opacity-5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-inter font-medium">{item.title}</h4>
                    <span className="text-xs py-1 px-2 bg-success bg-opacity-20 text-success rounded">In Progress</span>
                  </div>
                  <div className="flex items-center text-sm text-secondary mb-2">
                    <i className={item.category?.toLowerCase()?.includes('language') ? "ri-translate-2 mr-1" : "ri-book-open-line mr-1"}></i>
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-secondary">{item.progress}%</span>
                    </div>
                    <button 
                      className="text-xs text-primary hover:text-accent transition-colors"
                      onClick={() => handleContinueLearning(item.id)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningSection;