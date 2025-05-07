import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { navigateToAddItem } from "@/lib/navigationHelpers";

const IdeasSection = () => {
  const { ideas, voteIdea, isLoading } = useAppContext();
  
  const handleVote = async (id: number, upvote: boolean) => {
    await voteIdea(id, upvote);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-inter font-semibold text-primary dark:text-white">Idea Bank</h2>
          <button className="text-secondary hover:text-primary transition-colors">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
        
        {ideas.length === 0 ? (
          <div className="text-center py-6 text-secondary">
            <i className="ri-lightbulb-line text-4xl mb-2"></i>
            <p>No ideas yet. Add your first idea!</p>
          </div>
        ) : (
          [...ideas]
            .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
            .slice(0, 3)
            .map(idea => (
            <div 
              key={idea.id} 
              className="mb-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-inter font-medium">{idea.title}</h3>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-secondary mr-2">
                    {(idea.votes ?? 0) > 0 ? `+${idea.votes ?? 0}` : idea.votes ?? 0}
                  </span>
                  <div className="flex">
                    <button 
                      className="h-7 w-7 bg-gray-100 hover:bg-gray-200 rounded-l-md flex items-center justify-center text-secondary transition-colors"
                      onClick={() => handleVote(idea.id, true)}
                    >
                      <i className="ri-arrow-up-s-line"></i>
                    </button>
                    <button 
                      className="h-7 w-7 bg-gray-100 hover:bg-gray-200 rounded-r-md flex items-center justify-center text-secondary transition-colors"
                      onClick={() => handleVote(idea.id, false)}
                    >
                      <i className="ri-arrow-down-s-line"></i>
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-sm text-secondary mb-2">{idea.description}</p>
              <div className="flex items-center text-xs text-secondary flex-wrap">
                {idea.tags?.map((tag, index) => (
                  <span key={index} className="bg-primary bg-opacity-10 py-1 px-2 rounded mr-2 mb-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
        
        <button 
          className="text-accent hover:text-opacity-80 text-sm font-medium flex items-center mt-2 transition-colors"
          onClick={() => navigateToAddItem('/ideas')}
        >
          <i className="ri-add-line mr-1"></i> Add New Idea
        </button>
      </CardContent>
    </Card>
  );
};

export default IdeasSection;
