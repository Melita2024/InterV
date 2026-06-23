import Agent from "@/components/Agent";
import MicCheck from "@/components/MicCheck";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview generation</h3>

      <MicCheck />


      <Agent userName={user?.name!} userId={user?.id} type="generate" userProfilePhoto={user?.profilePhoto} />
    </>
  );
};

export default Page;
