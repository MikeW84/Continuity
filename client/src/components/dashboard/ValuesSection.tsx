import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ValuesSection = () => {
  const { values, dreams, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Skeleton className="h-6 w-28 mb-3" />
              <div className="space-y-4">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            </div>
            
            <div>
              <Skeleton className="h-6 w-28 mb-3" />
              <div className="space-y-4">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-inter font-semibold text-primary">Values & Dreams</h2>
          <button className="text-secondary hover:text-primary transition-colors">
            <i className="ri-more-2-fill"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-inter font-medium text-sm uppercase text-secondary mb-3">Core Values</h3>
            
            {values.length === 0 ? (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-secondary">Define your core values to guide your decisions.</p>
              </div>
            ) : (
              values.map(value => (
                <div key={value.id} className="mb-4 p-4 bg-primary bg-opacity-5 rounded-lg">
                  <h4 className="font-inter font-medium mb-2">{value.title}</h4>
                  <p className="text-sm text-secondary mb-3">{value.description}</p>
                </div>
              ))
            )}
          </div>
          
          <div>
            <h3 className="font-inter font-medium text-sm uppercase text-secondary mb-3">Future Dreams</h3>
            
            {dreams.length === 0 ? (
              <div className="mb-4 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-secondary">Capture your dreams and aspirations for the future.</p>
              </div>
            ) : (
              dreams.map(dream => (
                <div key={dream.id} className="mb-4 p-4 border border-accent border-opacity-30 rounded-lg relative">
                  <div className="absolute top-0 right-0 w-4 h-4 bg-accent rounded-bl-lg rounded-tr-lg"></div>
                  <h4 className="font-inter font-medium mb-2">{dream.title}</h4>
                  <p className="text-sm text-secondary mb-2">{dream.description}</p>
                  
                  <div className="flex items-center text-xs text-primary flex-wrap">
                    {dream.tags?.map((tag, index) => (
                      <span key={index} className="bg-primary bg-opacity-10 py-1 px-2 rounded mr-2 mb-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <button className="text-accent hover:text-opacity-80 text-sm font-medium flex items-center mt-4 transition-colors">
          <i className="ri-add-line mr-1"></i> Add Value or Dream
        </button>
      </CardContent>
    </Card>
  );
};

export default ValuesSection;
