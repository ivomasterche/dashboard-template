import { Card, CardContent, CardHeader } from "./card";

type Props = {
  text?: string;
  error?: string;
};

export default function ErrorBlock(props: Props) {
  const { text, error } = props;
  return (
    <div className="space-y-6 flex flex-col justify-center">
      <Card className="flex flex-col items-center justify-center border-red-500 flex-grow-0">
        <CardHeader>
          <h4 className="mb-0">Error</h4>
        </CardHeader>
        <CardContent>
          <p>{text}</p>

          {error && <p>{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
